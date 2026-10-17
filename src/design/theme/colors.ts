/**
 * The colour palette shared by every video.
 *
 * Rule of thumb: dark, desaturated backgrounds + a few saturated, warm
 * accents per shot. Never use more than ~3 accent hues in one frame.
 */
export const palette = {
  // Backgrounds — deep space blues, darkest to lightest.
  night900: '#070B1E',
  night800: '#0E1433',
  night700: '#18214D',
  night600: '#253170',
  night500: '#36469A',

  // Neutrals.
  white: '#F7F4EC',
  cloud: '#C9CEE8',
  slate: '#7B83AD',
  ink: '#05070F',

  // Accents.
  sun: '#FFC93C',
  amber: '#FF9F2E',
  coral: '#FF5E5B',
  pink: '#FF6FB5',
  violet: '#9B6BFF',
  sky: '#3DA9FF',
  cyan: '#3DE3E0',
  mint: '#5CE6A6',
  lime: '#A6E34B',
} as const;

export type PaletteColor = keyof typeof palette;

/** Semantic colour roles. Prefer these over raw palette values in scenes. */
export const colors = {
  background: palette.night800,
  backgroundDeep: palette.night900,
  backgroundLight: palette.night600,
  surface: palette.night700,

  text: palette.white,
  textMuted: palette.cloud,
  textSubtle: palette.slate,

  primary: palette.sun,
  secondary: palette.sky,
  tertiary: palette.pink,

  positive: palette.mint,
  negative: palette.coral,
  highlight: palette.amber,

  shadow: '#00000055',
} as const;

/** Background gradient presets (top → bottom). */
export const gradients = {
  space: [palette.night900, palette.night700],
  dusk: [palette.night800, '#3A2E6E'],
  ocean: ['#04213A', '#0B4F6C'],
  forest: ['#0B2A1F', '#1E5B3A'],
  ember: ['#1F0B1E', '#5A1E3A'],
} as const satisfies Record<string, readonly [string, string]>;

export type GradientName = keyof typeof gradients;
