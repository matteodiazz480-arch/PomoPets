import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { playSound } from '../audio/sounds';
import { ALL_ACCESSORY_IDS, getAccessoryById, type AccessoryCategory, type AccessoryId } from '../data/accessories';
import { getFoodById, type FoodId } from '../data/food';
import { getMissionById, type MissionId } from '../data/missions';
import {
  COINS_PER_MINUTE,
  COINS_SESSION_BONUS,
  levelFromTotalXp,
  XP_PER_MINUTE,
  XP_SESSION_BONUS,
} from '../data/progression';
import {
  cancelCareReminder,
  cancelNotification,
  dismissTimerProgressNotification,
  scheduleCareReminder,
  scheduleTimerNotification,
  showTimerProgressNotification,
} from '../notifications/notifications';
import { syncPlayerScore, type TournamentPlayer } from '../services/firebase';

const STORAGE_KEY = 'pomopets:v1';
const MAX_STAT = 100;
const STAT_DECAY_PER_DAY = 55;

type TimerPhase = 'idle' | 'focus' | 'break';

export type Task = {
  id: string;
  text: string;
  done: boolean;
};

type GameState = {
  playerId: string;
  playerName: string;
  photoUrl: string | null;
  petName: string | null;
  tasks: Task[];
  coins: number;
  totalXp: number;
  streak: number;
  lastStudyDate: string | null;
  pomodoroMinutes: number;
  breakMinutes: number;
  sessionsCompletedToday: number;
  minutesStudiedToday: number;
  minutesStudiedTotal: number;
  missionsDate: string | null;
  claimedMissions: MissionId[];
  hunger: number;
  happiness: number;
  inventory: Partial<Record<FoodId, number>>;
  ownedAccessories: AccessoryId[];
  equippedAccessories: Partial<Record<AccessoryCategory, AccessoryId>>;
  lastStatsDecayDate: string | null;
  feedsToday: number;
  timerPhase: TimerPhase;
  timerRunning: boolean;
  timerEndAt: number | null;
  timerSecondsSnapshot: number;
};

const DEFAULT_STATE: GameState = {
  playerId: '',
  playerName: '',
  photoUrl: null,
  petName: null,
  tasks: [],
  coins: 40,
  totalXp: 0,
  streak: 0,
  lastStudyDate: null,
  pomodoroMinutes: 25,
  breakMinutes: 5,
  sessionsCompletedToday: 0,
  minutesStudiedToday: 0,
  minutesStudiedTotal: 0,
  missionsDate: null,
  claimedMissions: [],
  hunger: 100,
  happiness: 100,
  inventory: {},
  ownedAccessories: ALL_ACCESSORY_IDS,
  equippedAccessories: { face: 'glasses_round' },
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

function buildPlayerPayload(gs: GameState, overrides?: Partial<TournamentPlayer>): TournamentPlayer {
  return {
    id: gs.playerId || 'player_default',
    name: gs.playerName || 'Jugador',
    petName: gs.petName || 'Cornolín',
    level: levelFromTotalXp(gs.totalXp).level,
    totalXp: gs.totalXp,
    minutesStudied: gs.minutesStudiedTotal,
    streak: gs.streak,
    photoUrl: gs.photoUrl || '',
    ...overrides,
  };
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
  lastReward: { xp: number; coins: number } | null;
  clearLastReward: () => void;
  claimMission: (id: MissionId) => boolean;
  buyFood: (id: FoodId, price: number) => boolean;
  feedPet: (id: FoodId) => boolean;
  buyAccessory: (id: AccessoryId, price: number) => boolean;
  equipAccessory: (id: AccessoryId) => void;
  unequipAccessory: (category: AccessoryCategory) => void;
  rewardCoins: (amount: number) => void;
  setPetName: (name: string) => void;
  setPlayerName: (name: string) => void;
  setPhotoUrl: (url: string | null) => void;
  syncScoreToCloud: () => Promise<boolean>;
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
  const [activeTick, setActiveTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerNotifRef = useRef<string | null>(null);

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

      const updatedTotalXp = prev.totalXp + earnedXp;
      const updatedMinutes = prev.minutesStudiedTotal + prev.pomodoroMinutes;

      setTimeout(() => {
        syncPlayerScore(
          buildPlayerPayload(prev, {
            level: nextLevel,
            totalXp: updatedTotalXp,
            minutesStudied: updatedMinutes,
            streak,
          })
        ).catch(() => {});
      }, 50);

      return {
        ...prev,
        totalXp: updatedTotalXp,
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
        minutesStudiedTotal: updatedMinutes,
        missionsDate: today,
        claimedMissions: isNewMissionDay ? [] : prev.claimedMissions,
        feedsToday: isNewMissionDay ? 0 : prev.feedsToday,
        hunger: Math.max(0, prev.hunger - 14),
        lastStatsDecayDate: today,
      };
    });
  }, []);

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
          if (!parsed.playerId) {
            parsed.playerId = 'player_' + Math.random().toString(36).substring(2, 10);
          }
          if (parsed.playerName && parsed.playerName.startsWith('Estudiante')) {
            parsed.playerName = '';
          }
          if (parsed.photoUrl && parsed.photoUrl.length > 80000) {
            parsed.photoUrl = null;
          }
          parsed.ownedAccessories = Array.from(new Set([...(parsed.ownedAccessories ?? []), ...ALL_ACCESSORY_IDS]));
          setState(parsed);
          resyncTimer(parsed);
        } else {
          setState((prev) => ({
            ...prev,
            playerId: 'player_' + Math.random().toString(36).substring(2, 10),
            playerName: '',
          }));
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, [resyncTimer]);

  useEffect(() => {
    if (!loaded || !state.playerId) return;
    syncPlayerScore(buildPlayerPayload(state)).catch(() => {});
  }, [loaded, state.playerId]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

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

      const changed =
        missionReset ||
        hunger !== prev.hunger ||
        happiness !== prev.happiness ||
        streak !== prev.streak;
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
  }, [isRunning, phase, activeTick, clearInterval_, completeFocusSession]);

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

  const buyAccessory = useCallback((id: AccessoryId, price: number) => {
    let success = false;
    setState((prev) => {
      const owned = prev.ownedAccessories ?? [];
      if (owned.includes(id)) return prev;
      if (prev.coins < price) return prev;
      success = true;
      const acc = getAccessoryById(id);
      const category = acc ? acc.category : null;
      playSound('success');
      return {
        ...prev,
        coins: prev.coins - price,
        ownedAccessories: [...owned, id],
        equippedAccessories: category
          ? { ...(prev.equippedAccessories ?? {}), [category]: id }
          : (prev.equippedAccessories ?? {}),
      };
    });
    return success;
  }, []);

  const equipAccessory = useCallback((id: AccessoryId) => {
    const acc = getAccessoryById(id);
    if (!acc) return;
    playSound('tap');
    setState((prev) => {
      const owned = prev.ownedAccessories ?? [];
      if (!owned.includes(id)) return prev;
      return {
        ...prev,
        equippedAccessories: {
          ...(prev.equippedAccessories ?? {}),
          [acc.category]: id,
        },
      };
    });
  }, []);

  const unequipAccessory = useCallback((category: AccessoryCategory) => {
    playSound('tap');
    setState((prev) => {
      const updated = { ...(prev.equippedAccessories ?? {}) };
      delete updated[category];
      return {
        ...prev,
        equippedAccessories: updated,
      };
    });
  }, []);

  const rewardCoins = useCallback((amount: number) => {
    playSound('coin');
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const setPetName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 18);
    setState((prev) => ({ ...prev, petName: trimmed.length > 0 ? trimmed : null }));
  }, []);

  const setPlayerName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) return;
    setState((prev) => ({ ...prev, playerName: trimmed }));
  }, []);

  const setPhotoUrl = useCallback((url: string | null) => {
    setState((prev) => ({ ...prev, photoUrl: url }));
  }, []);

  const syncScoreToCloud = useCallback(async () => {
    if (!state.playerId) return false;
    return syncPlayerScore(buildPlayerPayload(state));
  }, [state]);

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
    lastReward,
    clearLastReward: () => setLastReward(null),
    claimMission,
    buyFood,
    feedPet,
    buyAccessory,
    equipAccessory,
    unequipAccessory,
    rewardCoins,
    setPetName,
    setPlayerName,
    setPhotoUrl,
    syncScoreToCloud,
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
