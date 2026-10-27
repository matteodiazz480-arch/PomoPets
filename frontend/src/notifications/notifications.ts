import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { dismissNotificationAsync } from 'expo-notifications/build/dismissNotificationAsync';
import { requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

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
} catch {}

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
  } catch {}
}

type TimerNotifPhase = 'focus' | 'break';

const TIMER_COPY: Record<TimerNotifPhase, { title: string; body: string }> = {
  focus: { title: '🎉 ¡Sesión completada!', body: 'Tu mascota está orgullosa de ti. Volvé a ver cómo te fue.' },
  break: { title: '☕ Descanso terminado', body: '¿Listo para otra sesión de enfoque?' },
};

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
      trigger: null,
    });
  } catch {}
}

export async function dismissTimerProgressNotification() {
  try {
    await dismissNotificationAsync(TIMER_PROGRESS_ID);
  } catch {}
}

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
