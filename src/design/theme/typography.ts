import type {TxtProps} from '@motion-canvas/2d';
import {colors} from './colors';

/** Font families. Loaded once in `src/styles/fonts.css`. */
export const fonts = {
  display: 'Outfit Variable, Outfit, sans-serif',
  body: 'Nunito Variable, Nunito, sans-serif',
  mono: 'JetBrains Mono, Menlo, monospace',
} as const;

/** Type scale in pixels, tuned for a 1920×1080 canvas. */
export const fontSize = {
  hero: 160,
  h1: 112,
  h2: 80,
  h3: 56,
  body: 44,
  caption: 36,
  label: 28,
  small: 22,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
  black: 800,
} as const;

/** Ready-to-spread text presets: `<Txt {...text.h1} text="Hello" />`. */
export const text = {
  hero: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    letterSpacing: -4,
    fill: colors.text,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    letterSpacing: -2,
    fill: colors.text,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
    letterSpacing: -1,
    fill: colors.text,
  },
  h3: {
    fontFamily: fonts.display,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.medium,
    fill: colors.text,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    fill: colors.text,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    fill: colors.text,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: fontSize.label,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    fill: colors.text,
  },
} as const satisfies Record<string, TxtProps>;
