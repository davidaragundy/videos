/**
 * "Coastal editorial" palette: warm, sun-faded print colours — terracotta, cream and apricot
 * from mid-century posters, plus a muted sea teal and sand for anything coastal.
 *
 * Rules: flat fills, no outlines, no pure white or black. One dark ground per shot
 * (terracotta, sea or ink) or one light ground (cream, sand) — never mix two darks.
 */
const core = {
  // Earth.
  terracotta: '#97463C',
  clay: '#B9614B',
  ink: '#33201B',
  // Light grounds.
  cream: '#F2E3CB',
  paper: '#F8EFE1',
  sand: '#E6C79C',
  sandDark: '#C99A68',
  // Warm accents.
  apricot: '#F3B26B',
  orange: '#EB9842',
  sun: '#F2A23A',
  coral: '#DE6A4E',
  blush: '#E9A38C',
  // Sea.
  seaDeep: '#1E4B52',
  sea: '#2D7470',
  seaLight: '#6FAFA3',
  foam: '#F6EAD6',
  sage: '#9DB89A',
} as const;

export const palette = {
  ...core,
  // Aliases kept so older videos keep working — they map onto the coastal palette.
  white: core.paper,
  cloud: core.cream,
  slate: core.blush,
  mint: core.seaLight,
  lime: core.sage,
  sky: core.seaLight,
  cyan: core.seaLight,
  pink: core.blush,
  violet: core.clay,
  amber: core.orange,
  skin: core.apricot,
  night900: core.ink,
  night800: '#4A2A23',
  night700: core.terracotta,
  night600: core.clay,
  night500: core.blush,
} as const;

export type PaletteColor = keyof typeof palette;

/** Semantic colour roles. Prefer these over raw palette values in scenes. */
export const colors = {
  background: core.terracotta,
  backgroundDeep: core.ink,
  backgroundLight: core.cream,
  surface: core.clay,

  /** Text on dark grounds. */
  text: core.cream,
  textMuted: core.apricot,
  textSubtle: core.blush,
  /** Text on light grounds. */
  textDark: core.ink,
  textDarkMuted: core.terracotta,

  primary: core.apricot,
  secondary: core.seaLight,
  tertiary: core.coral,

  positive: core.sage,
  negative: core.coral,
  highlight: core.sun,

  shadow: '#33201B55',
} as const;

/** Background gradients (top → bottom). Keep them subtle — it's print, not neon. */
export const gradients = {
  terracotta: [core.clay, core.terracotta],
  cream: [core.paper, core.cream],
  beach: [core.paper, '#F3D3A8'],
  sunset: ['#F6E2C4', '#EFB27A'],
  sea: [core.sea, core.seaDeep],
  ink: ['#4A2A23', core.ink],
  // Legacy names.
  space: ['#4A2A23', core.ink],
  dusk: [core.clay, core.terracotta],
  ocean: [core.sea, core.seaDeep],
  forest: ['#5E7A5A', '#34483A'],
  ember: [core.clay, '#6E2F28'],
} as const satisfies Record<string, readonly [string, string]>;

export type GradientName = keyof typeof gradients;
