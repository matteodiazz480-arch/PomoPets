export const colors = {
  skyTop: '#CDEBFF',
  skyBottom: '#F3FBFF',
  groundLight: '#DFF4E3',
  groundDark: '#C9ECD1',

  // Warm, cozy "storybook room" neutrals (matched to the fondo1 illustration) —
  // used for every card, shadow and body of text across the app.
  appBg: '#FBF5EC',
  card: '#FFFCF7',
  cardAlt: '#FBEEE0',

  primary: '#FF9F7A',
  primaryDark: '#FF7E52',
  primaryDeep: '#DD6136',
  secondary: '#7FB8F5',
  secondaryDark: '#5C9FE0',
  accentPurple: '#B8A6F0',
  success: '#6FCF97',

  coin: '#FFC94A',
  coinDark: '#F5A623',
  coinDeep: '#D98A1A',
  streak: '#FF6B6B',
  streakBg: '#FFE1E1',

  hunger: '#FF9F5A',
  hungerBg: '#FFE7D2',
  happiness: '#FF7AB0',
  happinessBg: '#FFE2EF',

  textPrimary: '#4A3B34',
  textSecondary: '#9C8778',
  textOnDark: '#FFFFFF',

  border: '#F0E2D0',
  shadow: 'rgba(120, 78, 48, 0.16)',

  white: '#FFFFFF',
  overlay: 'rgba(74, 59, 52, 0.45)',
} as const;

export const gradients = {
  sky: ['#CDEBFF', '#EAF6FF', '#F8FDFF'],
  sunset: ['#FFD3B0', '#FFB5A7', '#F5A9C6'],
  night: ['#3A3F73', '#5C5B9F', '#8C7FC7'],
  forest: ['#CDECC9', '#E6F6DE', '#F6FCEF'],
  coinButton: ['#FFDA79', '#FFC94A'],
} as const;

export type BackgroundThemeId = 'sky' | 'sunset' | 'night' | 'forest';
