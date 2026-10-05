// Imported from expo-notifications' individual submodules rather than the
// package root (`expo-notifications` / `expo-notifications/build/index`).
// The package root file unconditionally re-exports a "push auto-registration"
// side-effect module that throws the instant it's imported on Android inside
// Expo Go (push registration was removed from Expo Go in SDK 53) — even
// though we never touch push at all here, only local scheduling. Every
// submodule below was checked against its own source: none of them import
// that file or the package root, directly or transitively, so this sidesteps
// the crash entirely while keeping local notifications fully working in
// Expo Go, no development build required.
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { dismissNotificationAsync } from 'expo-notifications/build/dismissNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

// Custom notification sound (alarm.wav, declared in app.json's expo-notifications
// plugin) only actually plays on a native dev/production build — Expo Go can't
// bundle it, since that bundling happens at native build time. It silently falls
// back to the OS default sound there, so this is safe either way.
const NOTIFICATION_SOUND = 'alarm.wav';

try {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // ignore — notifications are a non-critical enhancement
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelNotification(id: string | null) {
  if (!id) return;
  try {
    await cancelScheduledNotificationAsync(id);
  } catch {
    // ignore — never let notification bookkeeping break the app
  }
}

type TimerNotifPhase = 'focus' | 'break';

const TIMER_COPY: Record<TimerNotifPhase, { title: string; body: string }> = {
  focus: { title: '🎉 ¡Sesión completada!', body: 'Tu mascota está orgullosa de ti. Volvé a ver cómo te fue.' },
  break: { title: '☕ Descanso terminado', body: '¿Listo para otra sesión de enfoque?' },
};

/**
 * Schedules the "your Pomodoro/break just finished" alert. This is what
 * actually notifies the user when the timer completes while the app is
 * backgrounded or the screen is off — our in-app sound only covers the
 * foreground case, since the OS won't run JS while backgrounded.
 */
export async function scheduleTimerNotification(seconds: number, phase: TimerNotifPhase): Promise<string | null> {
  if (seconds <= 0) return null;
  try {
    return await scheduleNotificationAsync({
      content: { ...TIMER_COPY[phase], sound: NOTIFICATION_SOUND },
      trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// "Timer in progress" status notification — shown in the status bar the
// moment the app is backgrounded while a Pomodoro/break is running, so the
// user can glance at how much time is left without opening the app.
//
// Important honesty note: expo-notifications has no live "chronometer" field
// (verified against the SDK 57 docs) — a truly second-by-second ticking
// countdown in the tray requires native code (an Android foreground-service
// notification, or an iOS Live Activity), which isn't achievable from
// Expo's managed JS API. What this gives instead is a fresh snapshot —
// "quedan 18 min · termina a las 14:35" — refreshed every time the app is
// backgrounded, plus the precise completion alert already covered above.
// ---------------------------------------------------------------------------

const TIMER_PROGRESS_ID = 'pomopets-timer-progress';

export async function showTimerProgressNotification(phase: TimerNotifPhase, secondsLeft: number) {
  await dismissTimerProgressNotification();

  const finishAt = new Date(Date.now() + secondsLeft * 1000);
  const hh = finishAt.getHours().toString().padStart(2, '0');
  const mm = finishAt.getMinutes().toString().padStart(2, '0');
  const minutesLeft = Math.max(1, Math.round(secondsLeft / 60));
  const title = phase === 'focus' ? '🎯 Enfoque en curso' : '☕ Descanso en curso';
  const body = `Quedan ${minutesLeft} min · termina a las ${hh}:${mm}`;

  try {
    await scheduleNotificationAsync({
      identifier: TIMER_PROGRESS_ID,
      content: { title, body, sticky: true, sound: false },
      trigger: null, // deliver immediately — this is a live status, not a future alert
    });
  } catch {
    // ignore — this is a nice-to-have status display
  }
}

export async function dismissTimerProgressNotification() {
  try {
    await dismissNotificationAsync(TIMER_PROGRESS_ID);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// "Come back" care reminder — one gentle nudge scheduled for a sensible time
// later today (not just N hours from now), rescheduled each time the app is
// backgrounded so there's never more than one pending at once.
// ---------------------------------------------------------------------------

const STREAK_MESSAGES: { title: string; body: string }[] = [
  { title: '🔥 Tu racha te espera', body: '¡Hola! ¿Estudiamos un ratito hoy para mantener el fuego encendido?' },
  { title: '🔥 No dejes que se apague', body: 'Todavía estás a tiempo de sumar un día más a tu racha.' },
  { title: '📚 Un empujón rápido', body: 'Con una sesión de Pomodoro tu racha sigue viva. ¡Vamos!' },
  { title: '🔥 Racha en juego', body: 'Hoy todavía no estudiamos nada... ¿le damos aunque sea 15 minutitos?' },
  { title: '⏳ Últimas horas del día', body: 'Todavía llegás a sumar hoy a tu racha si te enfocás un rato.' },
];

const SAD_MESSAGES: { title: string; body: string }[] = [
  { title: '🐾 Tu mascota te extraña', body: 'Hace rato que no la visitás. ¡Volvé cuando puedas para cuidarla!' },
  { title: '🥺 Tengo hambre...', body: 'Tu mascota necesita cariño y comida. ¡Un ratito de estudio la alegra mucho!' },
  { title: '💛 Un abrazo pendiente', body: 'Extraño nuestras sesiones juntos. ¿Volvemos a estudiar hoy?' },
  { title: '🐾 ¿Seguimos jugando?', body: 'Tu mascota se puso un poco triste. ¡Alimentala o estudien juntos!' },
];

let careReminderId: string | null = null;

/**
 * Picks a sensible future clock time for today's reminder based on the
 * current hour, so it lands when it's actually useful — not literally N
 * hours from whenever the user happened to background the app:
 *  - morning (before 13:00) → reminder at 17:00 (tarde)
 *  - afternoon (13:00–19:00) → reminder at 20:30 (noche)
 *  - evening (after 19:00) → a short nudge 2h later, but never past 22:30
 *    (no point pinging someone at 1am — returns null, meaning "skip today")
 */
function computeSmartReminderDate(now: Date): Date | null {
  const hour = now.getHours();
  const target = new Date(now);

  if (hour < 13) {
    target.setHours(17, 0, 0, 0);
  } else if (hour < 19) {
    target.setHours(20, 30, 0, 0);
  } else {
    target.setTime(now.getTime() + 2 * 60 * 60 * 1000);
    if (target.getHours() >= 23 || target.getHours() < 6) return null;
  }

  if (target.getTime() <= now.getTime()) target.setTime(now.getTime() + 30 * 60 * 1000);
  return target;
}

export async function scheduleCareReminder(opts: { sad: boolean; streakAtRisk: boolean }) {
  await cancelNotification(careReminderId);
  careReminderId = null;
  if (!opts.sad && !opts.streakAtRisk) return;

  const when = computeSmartReminderDate(new Date());
  if (!when) return;

  const { title, body } = opts.sad ? pick(SAD_MESSAGES) : pick(STREAK_MESSAGES);

  try {
    careReminderId = await scheduleNotificationAsync({
      content: { title, body, sound: NOTIFICATION_SOUND },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    careReminderId = null;
  }
}

export async function cancelCareReminder() {
  await cancelNotification(careReminderId);
  careReminderId = null;
}
