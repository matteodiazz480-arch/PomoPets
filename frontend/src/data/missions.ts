import type { Ionicons } from '@expo/vector-icons';

export type MissionId =
  | 'first_session'
  | 'two_sessions'
  | 'triple_focus'
  | 'quad_focus'
  | 'quarter_hour'
  | 'half_hour'
  | 'fifty_minutes'
  | 'deep_focus'
  | 'hour_power'
  | 'feed_friend'
  | 'feed_twice'
  | 'well_fed'
  | 'happy_pet'
  | 'perfect_care';

export type MissionProgressState = {
  sessionsCompletedToday: number;
  minutesStudiedToday: number;
  feedsToday: number;
  hunger: number;
  happiness: number;
};

export type MissionDef = {
  id: MissionId;
  title: string;
  description: string;
  xp: number;
  coins: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  target: number;
  getProgress: (s: MissionProgressState) => number;
};

// The full catalog of possible daily missions. Which ones show up on a given
// day is decided by WEEKLY_SCHEDULE below, not by picking from here directly.
const MISSION_POOL: Record<MissionId, MissionDef> = {
  first_session: {
    id: 'first_session',
    title: 'Primer enfoque',
    description: 'Completa 1 sesión Pomodoro hoy',
    xp: 20,
    coins: 10,
    icon: 'checkmark-circle-outline',
    target: 1,
    getProgress: (s) => s.sessionsCompletedToday,
  },
  two_sessions: {
    id: 'two_sessions',
    title: 'Doble sesión',
    description: 'Completa 2 sesiones Pomodoro hoy',
    xp: 40,
    coins: 18,
    icon: 'layers-outline',
    target: 2,
    getProgress: (s) => s.sessionsCompletedToday,
  },
  triple_focus: {
    id: 'triple_focus',
    title: 'Triple enfoque',
    description: 'Completa 3 sesiones Pomodoro hoy',
    xp: 60,
    coins: 25,
    icon: 'flame-outline',
    target: 3,
    getProgress: (s) => s.sessionsCompletedToday,
  },
  quad_focus: {
    id: 'quad_focus',
    title: 'Racha imparable',
    description: 'Completa 4 sesiones Pomodoro hoy',
    xp: 90,
    coins: 40,
    icon: 'flash-outline',
    target: 4,
    getProgress: (s) => s.sessionsCompletedToday,
  },
  quarter_hour: {
    id: 'quarter_hour',
    title: 'Calentando motores',
    description: 'Estudia 15 minutos en total hoy',
    xp: 15,
    coins: 8,
    icon: 'time-outline',
    target: 15,
    getProgress: (s) => s.minutesStudiedToday,
  },
  half_hour: {
    id: 'half_hour',
    title: 'Media hora productiva',
    description: 'Estudia 30 minutos en total hoy',
    xp: 35,
    coins: 15,
    icon: 'hourglass-outline',
    target: 30,
    getProgress: (s) => s.minutesStudiedToday,
  },
  fifty_minutes: {
    id: 'fifty_minutes',
    title: 'Meta del lunes',
    description: 'Estudia 50 minutos en total hoy',
    xp: 65,
    coins: 28,
    icon: 'school-outline',
    target: 50,
    getProgress: (s) => s.minutesStudiedToday,
  },
  deep_focus: {
    id: 'deep_focus',
    title: 'Enfoque profundo',
    description: 'Estudia 45 minutos en total hoy',
    xp: 55,
    coins: 22,
    icon: 'book-outline',
    target: 45,
    getProgress: (s) => s.minutesStudiedToday,
  },
  hour_power: {
    id: 'hour_power',
    title: 'Hora de poder',
    description: 'Estudia 60 minutos en total hoy',
    xp: 75,
    coins: 32,
    icon: 'rocket-outline',
    target: 60,
    getProgress: (s) => s.minutesStudiedToday,
  },
  feed_friend: {
    id: 'feed_friend',
    title: 'Hora de comer',
    description: 'Alimenta a tu mascota hoy',
    xp: 15,
    coins: 10,
    icon: 'nutrition-outline',
    target: 1,
    getProgress: (s) => s.feedsToday,
  },
  feed_twice: {
    id: 'feed_twice',
    title: 'Doble ración',
    description: 'Alimenta a tu mascota 2 veces hoy',
    xp: 30,
    coins: 16,
    icon: 'restaurant-outline',
    target: 2,
    getProgress: (s) => s.feedsToday,
  },
  well_fed: {
    id: 'well_fed',
    title: 'Bien alimentada',
    description: 'Mantén el hambre de tu mascota en 70% o más',
    xp: 20,
    coins: 12,
    icon: 'egg-outline',
    target: 1,
    getProgress: (s) => (s.hunger >= 70 ? 1 : 0),
  },
  happy_pet: {
    id: 'happy_pet',
    title: 'Mascota feliz',
    description: 'Mantén la felicidad de tu mascota en 70% o más',
    xp: 20,
    coins: 12,
    icon: 'heart-outline',
    target: 1,
    getProgress: (s) => (s.happiness >= 70 ? 1 : 0),
  },
  perfect_care: {
    id: 'perfect_care',
    title: 'Cuidado perfecto',
    description: 'Hambre y felicidad al 80% o más al mismo tiempo',
    xp: 30,
    coins: 18,
    icon: 'sparkles-outline',
    target: 1,
    getProgress: (s) => (s.hunger >= 80 && s.happiness >= 80 ? 1 : 0),
  },
};

// Which missions show up each day of the week — index matches Date#getDay()
// (0 = Sunday … 6 = Saturday), so the set is stable week to week: the same
// weekday always brings back the same objectives instead of a random mix.
const WEEKLY_SCHEDULE: Record<number, MissionId[]> = {
  0: ['first_session', 'quarter_hour', 'feed_friend', 'happy_pet'], // Domingo — día suave
  1: ['fifty_minutes', 'two_sessions', 'feed_friend', 'well_fed'], // Lunes — arranque de semana
  2: ['triple_focus', 'half_hour', 'feed_twice', 'happy_pet'], // Martes — doble ración
  3: ['deep_focus', 'two_sessions', 'feed_friend', 'well_fed'], // Miércoles
  4: ['hour_power', 'triple_focus', 'feed_twice', 'perfect_care'], // Jueves
  5: ['quad_focus', 'half_hour', 'feed_friend', 'happy_pet'], // Viernes
  6: ['perfect_care', 'quarter_hour', 'two_sessions', 'well_fed'], // Sábado
};

/**
 * Today's missions are decided purely by the day of the week, parsed out of a
 * yyyy-m-d date string (same format as GameContext's todayKey) — so the same
 * weekday always shows the same objectives, e.g. every Monday brings the
 * 50-minute goal, every Tuesday brings "feed twice".
 */
export function getDailyMissions(dateKey: string): MissionDef[] {
  const [y, m, d] = dateKey.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return WEEKLY_SCHEDULE[weekday].map((id) => MISSION_POOL[id]);
}

export function getMissionById(id: MissionId): MissionDef | undefined {
  return MISSION_POOL[id];
}

// Kept for any code that still wants "today's missions" without threading a
// date through — resolves to the current device date.
export function getTodaysMissions(): MissionDef[] {
  const d = new Date();
  return getDailyMissions(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
}
