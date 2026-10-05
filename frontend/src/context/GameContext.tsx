import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { playSound } from '../audio/sounds';
import { getFoodById, type FoodId } from '../data/food';
import { getMissionById, type MissionId } from '../data/missions';
import {
  cancelCareReminder,
  cancelNotification,
  dismissTimerProgressNotification,
  scheduleCareReminder,
  scheduleTimerNotification,
  showTimerProgressNotification,
} from '../notifications/notifications';
import {
  COINS_PER_MINUTE,
  COINS_SESSION_BONUS,
  levelFromTotalXp,
  XP_PER_MINUTE,
  XP_SESSION_BONUS,
} from '../data/progression';
import type { BackgroundThemeId } from '../theme/colors';

const STORAGE_KEY = 'pomopets:v1';

const MAX_STAT = 100;
// Bumped from 20 → 32 per day so hunger/happiness need attention more often —
// a livelier day-to-day care loop instead of barely moving between sessions.
const STAT_DECAY_PER_DAY = 32;

type TimerPhase = 'idle' | 'focus' | 'break';

export type Task = {
  id: string;
  text: string;
  done: boolean;
};

type GameState = {
  petName: string | null;
  tasks: Task[];
  coins: number;
  totalXp: number;
  streak: number;
  lastStudyDate: string | null; // yyyy-mm-dd
  pomodoroMinutes: number;
  breakMinutes: number;
  ownedBackgrounds: BackgroundThemeId[];
  activeBackground: BackgroundThemeId;
  sessionsCompletedToday: number;
  minutesStudiedToday: number;
  minutesStudiedTotal: number;
  missionsDate: string | null;
  claimedMissions: MissionId[];
  hunger: number;
  happiness: number;
  inventory: Partial<Record<FoodId, number>>;
  lastStatsDecayDate: string | null;
  feedsToday: number;
  // Timer snapshot, persisted purely so the countdown survives the app being
  // fully closed and reopened — see resyncTimer for how it's used.
  timerPhase: TimerPhase;
  timerRunning: boolean;
  timerEndAt: number | null; // epoch ms, valid only while timerRunning
  timerSecondsSnapshot: number; // valid only while !timerRunning
};

const DEFAULT_STATE: GameState = {
  petName: null,
  tasks: [],
  coins: 40,
  totalXp: 0,
  streak: 0,
  lastStudyDate: null,
  pomodoroMinutes: 25,
  breakMinutes: 5,
  ownedBackgrounds: ['sky'],
  activeBackground: 'sky',
  sessionsCompletedToday: 0,
  minutesStudiedToday: 0,
  minutesStudiedTotal: 0,
  missionsDate: null,
  claimedMissions: [],
  hunger: 100,
  happiness: 100,
  inventory: {},
  lastStatsDecayDate: null,
  feedsToday: 0,
  timerPhase: 'idle',
  timerRunning: false,
  timerEndAt: null,
  timerSecondsSnapshot: 25 * 60,
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / 86400000);
}

type GameContextValue = {
  state: GameState;
  loaded: boolean;
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  phase: TimerPhase;
  secondsLeft: number;
  isRunning: boolean;
  startFocus: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setPomodoroMinutes: (minutes: number) => void;
  setBreakMinutes: (minutes: number) => void;
  buyBackground: (id: BackgroundThemeId, price: number) => boolean;
  setActiveBackground: (id: BackgroundThemeId) => void;
  lastReward: { xp: number; coins: number } | null;
  clearLastReward: () => void;
  claimMission: (id: MissionId) => boolean;
  buyFood: (id: FoodId, price: number) => boolean;
  feedPet: (id: FoodId) => boolean;
  setPetName: (name: string) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_STATE.pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [lastReward, setLastReward] = useState<{ xp: number; coins: number } | null>(null);
  // Bumped every time the app returns to the foreground, purely to force the
  // countdown effect below to rebuild its interval — isRunning/phase alone
  // may be unchanged across a background trip, so they wouldn't trigger it.
  const [activeTick, setActiveTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerNotifRef = useRef<string | null>(null);

  // Mirrors for values the AppState listener and callbacks need fresh —
  // without these, closures captured at effect-setup time would see stale data.
  const stateRef = useRef(state);
  const secondsLeftRef = useRef(secondsLeft);
  const phaseRef = useRef(phase);
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const completeFocusSession = useCallback(() => {
    setState((prev) => {
      const earnedXp = prev.pomodoroMinutes * XP_PER_MINUTE + XP_SESSION_BONUS;
      const earnedCoins = prev.pomodoroMinutes * COINS_PER_MINUTE + COINS_SESSION_BONUS;
      const today = todayKey();
      const isNewMissionDay = prev.missionsDate !== today;
      let streak = prev.streak;
      if (prev.lastStudyDate === null) {
        streak = 1;
      } else {
        const diff = daysBetween(prev.lastStudyDate, today);
        if (diff === 0) streak = prev.streak || 1;
        else if (diff === 1) streak = prev.streak + 1;
        else streak = 1;
      }
      setLastReward({ xp: earnedXp, coins: earnedCoins });

      const prevLevel = levelFromTotalXp(prev.totalXp).level;
      const nextLevel = levelFromTotalXp(prev.totalXp + earnedXp).level;
      playSound('success');
      if (nextLevel > prevLevel) {
        setTimeout(() => playSound('levelup'), 550);
      }

      return {
        ...prev,
        totalXp: prev.totalXp + earnedXp,
        coins: prev.coins + earnedCoins,
        streak,
        lastStudyDate: today,
        sessionsCompletedToday: isNewMissionDay
          ? 1
          : prev.lastStudyDate === today
            ? prev.sessionsCompletedToday + 1
            : 1,
        minutesStudiedToday: isNewMissionDay
          ? prev.pomodoroMinutes
          : prev.minutesStudiedToday + prev.pomodoroMinutes,
        minutesStudiedTotal: prev.minutesStudiedTotal + prev.pomodoroMinutes,
        missionsDate: today,
        claimedMissions: isNewMissionDay ? [] : prev.claimedMissions,
        feedsToday: isNewMissionDay ? 0 : prev.feedsToday,
        lastStatsDecayDate: today,
      };
    });
  }, []);

  // Reconciles the live timer against wall-clock time — called on load (the app
  // may have been closed through a phase boundary) and whenever the app comes
  // back to the foreground (it may have been backgrounded through one, since
  // JS timers don't tick while backgrounded).
  const resyncTimer = useCallback(
    (gs: GameState) => {
      if (!gs.timerRunning || gs.timerEndAt == null) {
        setPhase(gs.timerPhase);
        setIsRunning(false);
        setSecondsLeft(gs.timerPhase === 'idle' ? gs.pomodoroMinutes * 60 : gs.timerSecondsSnapshot);
        return;
      }

      const remainingMs = gs.timerEndAt - Date.now();
      if (remainingMs > 0) {
        setPhase(gs.timerPhase);
        setIsRunning(true);
        setSecondsLeft(Math.ceil(remainingMs / 1000));
        return;
      }

      // The running phase finished while the app was away — settle it now.
      cancelNotification(timerNotifRef.current);
      timerNotifRef.current = null;

      if (gs.timerPhase === 'focus') {
        completeFocusSession();
        const seconds = gs.breakMinutes * 60;
        const endAt = Date.now() + seconds * 1000;
        setPhase('break');
        setIsRunning(true);
        setSecondsLeft(seconds);
        setState((prev) => ({ ...prev, timerPhase: 'break', timerRunning: true, timerEndAt: endAt }));
        scheduleTimerNotification(seconds, 'break').then((id) => {
          timerNotifRef.current = id;
        });
      } else {
        setPhase('idle');
        setIsRunning(false);
        setSecondsLeft(gs.pomodoroMinutes * 60);
        setState((prev) => ({
          ...prev,
          timerPhase: 'idle',
          timerRunning: false,
          timerEndAt: null,
          timerSecondsSnapshot: prev.pomodoroMinutes * 60,
        }));
      }
    },
    [completeFocusSession]
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = { ...DEFAULT_STATE, ...JSON.parse(raw) } as GameState;
          setState(parsed);
          resyncTimer(parsed);
        }
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  // Reset daily mission counters whenever a new day starts (e.g. app reopened tomorrow),
  // let hunger/happiness decay for each day that passed without a study session, and
  // break the streak outright the moment a full day was skipped — it shouldn't linger
  // at its old value until the next completed session quietly overwrites it.
  useEffect(() => {
    if (!loaded) return;
    setState((prev) => {
      const today = todayKey();
      const missionReset = prev.missionsDate !== today;

      let hunger = prev.hunger;
      let happiness = prev.happiness;
      let lastStatsDecayDate = prev.lastStatsDecayDate;
      const decayBaseline = lastStatsDecayDate ?? prev.lastStudyDate;
      if (decayBaseline) {
        const daysSince = daysBetween(decayBaseline, today);
        if (daysSince >= 1) {
          hunger = Math.max(0, hunger - STAT_DECAY_PER_DAY * daysSince);
          happiness = Math.max(0, happiness - STAT_DECAY_PER_DAY * daysSince);
          lastStatsDecayDate = today;
        }
      }

      let streak = prev.streak;
      if (prev.lastStudyDate && prev.streak !== 0) {
        const daysSinceStudy = daysBetween(prev.lastStudyDate, today);
        if (daysSinceStudy >= 2) streak = 0;
      }

      const changed = missionReset || hunger !== prev.hunger || happiness !== prev.happiness || streak !== prev.streak;
      if (!changed) return prev;

      return {
        ...prev,
        hunger,
        happiness,
        lastStatsDecayDate,
        streak,
        minutesStudiedToday: missionReset ? 0 : prev.minutesStudiedToday,
        sessionsCompletedToday: missionReset
          ? prev.lastStudyDate === today
            ? prev.sessionsCompletedToday
            : 0
          : prev.sessionsCompletedToday,
        feedsToday: missionReset ? 0 : prev.feedsToday,
        claimedMissions: missionReset ? [] : prev.claimedMissions,
        missionsDate: missionReset ? today : prev.missionsDate,
      };
    });
  }, [loaded]);

  // Backgrounding: kill the ticking interval immediately — on Android, unlike
  // iOS, JS keeps running while backgrounded unless told otherwise, so a
  // per-second interval left alive here would spin for as long as the app
  // sits in the background, burning CPU/battery the whole time (this is the
  // fix for that). Wall-clock resync on return covers the elapsed time
  // instead, so nothing needs to tick while nobody's looking. Also arms a
  // single gentle reminder if the pet needs attention or the streak hasn't
  // been extended today, and — if a Pomodoro is actively running — posts a
  // status-bar snapshot of how much time is left.
  // Foregrounding: that reminder and status notification are no longer
  // needed, and activeTick forces a fresh interval to be created (isRunning
  // itself may not have "changed" across the trip, so the effect below
  // wouldn't otherwise know to rebuild it).
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        cancelCareReminder();
        dismissTimerProgressNotification();
        resyncTimer(stateRef.current);
        setActiveTick((t) => t + 1);
      } else if (next === 'background') {
        clearInterval_();

        const gs = stateRef.current;
        const sad = gs.hunger < 30 || gs.happiness < 30;
        const streakAtRisk = gs.lastStudyDate !== todayKey();
        scheduleCareReminder({ sad, streakAtRisk });

        if (isRunningRef.current && phaseRef.current !== 'idle') {
          showTimerProgressNotification(phaseRef.current, secondsLeftRef.current);
        }
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [resyncTimer, clearInterval_]);

  const claimMission = useCallback((id: MissionId) => {
    let claimed = false;
    setState((prev) => {
      if (prev.claimedMissions.includes(id)) return prev;
      const mission = getMissionById(id);
      if (!mission) return prev;
      const progress = mission.getProgress(prev);
      if (progress < mission.target) return prev;

      claimed = true;
      const prevLevel = levelFromTotalXp(prev.totalXp).level;
      const newTotalXp = prev.totalXp + mission.xp;
      const nextLevel = levelFromTotalXp(newTotalXp).level;
      playSound('quest');
      if (nextLevel > prevLevel) {
        setTimeout(() => playSound('levelup'), 550);
      }

      return {
        ...prev,
        totalXp: newTotalXp,
        coins: prev.coins + mission.coins,
        claimedMissions: [...prev.claimedMissions, id],
      };
    });
    return claimed;
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          cancelNotification(timerNotifRef.current);
          timerNotifRef.current = null;
          dismissTimerProgressNotification();

          if (phase === 'focus') {
            completeFocusSession();
            const seconds = stateRef.current.breakMinutes * 60;
            const endAt = Date.now() + seconds * 1000;
            setPhase('break');
            setState((prev) => ({ ...prev, timerPhase: 'break', timerRunning: true, timerEndAt: endAt }));
            scheduleTimerNotification(seconds, 'break').then((id) => {
              timerNotifRef.current = id;
            });
            return seconds;
          } else {
            setPhase('idle');
            setIsRunning(false);
            const idleSeconds = stateRef.current.pomodoroMinutes * 60;
            setState((prev) => ({
              ...prev,
              timerPhase: 'idle',
              timerRunning: false,
              timerEndAt: null,
              timerSecondsSnapshot: prev.pomodoroMinutes * 60,
            }));
            return idleSeconds;
          }
        }
        return s - 1;
      });
    }, 1000);
    return clearInterval_;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, activeTick]);

  const startFocus = useCallback(() => {
    const seconds = stateRef.current.pomodoroMinutes * 60;
    const endAt = Date.now() + seconds * 1000;
    setPhase('focus');
    setSecondsLeft(seconds);
    setIsRunning(true);
    setState((prev) => ({ ...prev, timerPhase: 'focus', timerRunning: true, timerEndAt: endAt }));
    cancelNotification(timerNotifRef.current);
    scheduleTimerNotification(seconds, 'focus').then((id) => {
      timerNotifRef.current = id;
    });
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    const snapshot = secondsLeftRef.current;
    setState((prev) => ({ ...prev, timerRunning: false, timerEndAt: null, timerSecondsSnapshot: snapshot }));
    cancelNotification(timerNotifRef.current);
    timerNotifRef.current = null;
    dismissTimerProgressNotification();
  }, []);

  const resume = useCallback(() => {
    const seconds = secondsLeftRef.current;
    const endAt = Date.now() + seconds * 1000;
    setIsRunning(true);
    setState((prev) => ({ ...prev, timerRunning: true, timerEndAt: endAt }));
    scheduleTimerNotification(seconds, phaseRef.current === 'break' ? 'break' : 'focus').then((id) => {
      timerNotifRef.current = id;
    });
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('idle');
    const seconds = stateRef.current.pomodoroMinutes * 60;
    setSecondsLeft(seconds);
    setState((prev) => ({
      ...prev,
      timerPhase: 'idle',
      timerRunning: false,
      timerEndAt: null,
      timerSecondsSnapshot: seconds,
    }));
    cancelNotification(timerNotifRef.current);
    timerNotifRef.current = null;
    dismissTimerProgressNotification();
  }, []);

  const setPomodoroMinutes = useCallback((minutes: number) => {
    setState((prev) => ({ ...prev, pomodoroMinutes: minutes }));
    setSecondsLeft(minutes * 60);
  }, []);

  const setBreakMinutes = useCallback((minutes: number) => {
    setState((prev) => ({ ...prev, breakMinutes: minutes }));
  }, []);

  const buyBackground = useCallback((id: BackgroundThemeId, price: number) => {
    let success = false;
    setState((prev) => {
      if (prev.ownedBackgrounds.includes(id)) {
        success = true;
        return { ...prev, activeBackground: id };
      }
      if (prev.coins < price) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - price,
        ownedBackgrounds: [...prev.ownedBackgrounds, id],
        activeBackground: id,
      };
    });
    return success;
  }, []);

  const setActiveBackground = useCallback((id: BackgroundThemeId) => {
    setState((prev) =>
      prev.ownedBackgrounds.includes(id) ? { ...prev, activeBackground: id } : prev
    );
  }, []);

  const buyFood = useCallback((id: FoodId, price: number) => {
    let success = false;
    setState((prev) => {
      if (prev.coins < price) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - price,
        inventory: { ...prev.inventory, [id]: (prev.inventory[id] ?? 0) + 1 },
      };
    });
    return success;
  }, []);

  const feedPet = useCallback((id: FoodId) => {
    let success = false;
    setState((prev) => {
      const owned = prev.inventory[id] ?? 0;
      const food = getFoodById(id);
      if (owned <= 0 || !food) return prev;
      success = true;
      // Played here (inside the updater), not after setState — the same pattern
      // claimMission/completeFocusSession use, since a `success` flag read right
      // after setState isn't guaranteed to see this updater having run yet.
      playSound('feed');
      return {
        ...prev,
        inventory: { ...prev.inventory, [id]: owned - 1 },
        hunger: Math.min(MAX_STAT, prev.hunger + food.hunger),
        happiness: Math.min(MAX_STAT, prev.happiness + food.happiness),
        feedsToday: prev.feedsToday + 1,
      };
    });
    return success;
  }, []);

  const setPetName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 18);
    setState((prev) => ({ ...prev, petName: trimmed.length > 0 ? trimmed : null }));
  }, []);

  const addTask = useCallback((text: string) => {
    const trimmed = text.trim().slice(0, 60);
    if (trimmed.length === 0) return;
    const task: Task = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: trimmed, done: false };
    setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }, []);

  const { level, xpIntoLevel, xpToNext } = useMemo(() => levelFromTotalXp(state.totalXp), [state.totalXp]);

  const value: GameContextValue = {
    state,
    loaded,
    level,
    xpIntoLevel,
    xpToNext,
    phase,
    secondsLeft,
    isRunning,
    startFocus,
    pause,
    resume,
    reset,
    setPomodoroMinutes,
    setBreakMinutes,
    buyBackground,
    setActiveBackground,
    lastReward,
    clearLastReward: () => setLastReward(null),
    claimMission,
    buyFood,
    feedPet,
    setPetName,
    addTask,
    toggleTask,
    deleteTask,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
