export type PetPhraseContext = {
  hour: number; // 0-23, local device time
  streak: number;
  phase: 'idle' | 'focus' | 'break';
  elapsedFocusMinutes: number; // minutes into the current focus session, 0 if not focusing
};

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

const FOCUSING_EARLY = [
  '¡Vamos! Ya empezamos, tú puedes 💪',
  'Enfoque activado. ¡Aquí te acompaño!',
  '¡A darle con todo a esta sesión!',
];

const FOCUSING_MID = [
  '¡Llevas un buen rato enfocado, sigue así!',
  'Se nota la concentración, ¡no aflojes!',
  'Vas muy bien, un poquito más 🌟',
];

const FOCUSING_LONG = [
  '¡Llevas más de 20 minutos enfocado, estoy orgulloso!',
  '¡Qué constancia! Ya casi terminamos esta sesión.',
  'Impresionante racha de enfoque, ¡sigue así campeón!',
];

const BREAK = [
  'Buen trabajo, ¡te ganaste este descanso! ☕',
  'Respira un poco, ya vuelvo a estudiar contigo.',
  'Estírate y tómate agua, te lo mereces.',
];

const STREAK_HIGH = [
  '¡Llevas una racha increíble, no la rompas hoy!',
  '¡Wow, qué constancia! Sigamos sumando días.',
  'Tu racha me tiene orgulloso, ¡vamos por más!',
];

const STREAK_ZERO = [
  '¡Empecemos una racha nueva hoy!',
  'Hoy es un gran día para arrancar de nuevo.',
  '¡A romper los parciales hoy!',
];

const MORNING = [
  '¡Buenos días! ¿Empezamos con energía?',
  'Una mañana productiva nos espera 🌤️',
  '¡A romper los parciales hoy!',
];

const AFTERNOON = [
  '¿Cómo va tu tarde? ¡Sigamos enfocados!',
  'Un empujón más y la tarde queda dominada.',
  '¡Vamos por otra sesión productiva!',
];

const EVENING = [
  'La noche es buena para cerrar pendientes.',
  '¡Última sesión del día y a descansar!',
  'Terminemos el día con una buena racha.',
];

const NIGHT = [
  'Es tarde... ¿un último esfuerzo antes de dormir?',
  'No te desveles demasiado, ¡pero vamos una más!',
  'Shh, todo tranquilo. Estudiemos con calma.',
];

/**
 * Picks a comic-bubble line for the pet based on what's happening: focus
 * progress takes priority (it's the most "alive" moment), then streak
 * milestones, falling back to a time-of-day greeting.
 */
export function getPetPhrase(ctx: PetPhraseContext): string {
  if (ctx.phase === 'focus') {
    if (ctx.elapsedFocusMinutes >= 20) return pick(FOCUSING_LONG);
    if (ctx.elapsedFocusMinutes >= 8) return pick(FOCUSING_MID);
    return pick(FOCUSING_EARLY);
  }
  if (ctx.phase === 'break') return pick(BREAK);

  if (ctx.streak >= 5) return pick(STREAK_HIGH);
  if (ctx.streak === 0) return pick(STREAK_ZERO);

  if (ctx.hour < 12) return pick(MORNING);
  if (ctx.hour < 19) return pick(AFTERNOON);
  if (ctx.hour < 22) return pick(EVENING);
  return pick(NIGHT);
}
