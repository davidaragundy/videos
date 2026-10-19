import type {TxtProps} from '@motion-canvas/2d';
import {colors} from './colors';

/** Font families. Loaded once in `src/styles/fonts.css`. */
export const fonts = {
  /** Tight neo-grotesk for headlines and UI — the poster voice. */
  display: 'Inter Tight Variable, Inter Tight, sans-serif',
  body: 'Inter Tight Variable, Inter Tight, sans-serif',
  /** Serif italic for accents: numbers, single emphasised words. */
  serif: 'Instrument Serif, Georgia, serif',
  mono: 'JetBrains Mono, Menlo, monospace',
} as const;

/** Type scale in pixels, tuned for 1080-wide (vertical) and 1080-tall (landscape) canvases. */
export const fontSize = {
  hero: 168,
  h1: 120,
  h2: 84,
  h3: 56,
  body: 44,
  caption: 40,
  captionVertical: 70,
  label: 26,
  labelVertical: 34,
  small: 22,
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Ready-to-spread text presets: `<Txt {...text.h1} text="Hello" />`. */
export const text = {
  hero: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.medium,
    letterSpacing: -8,
    lineHeight: '92%',
    fill: colors.text,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: fontSize.h1,
    fontWeight: fontWeight.medium,
    letterSpacing: -5,
    lineHeight: '94%',
    fill: colors.text,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: fontSize.h2,
    fontWeight: fontWeight.medium,
    letterSpacing: -3,
    lineHeight: '100%',
    fill: colors.text,
  },
  h3: {
    fontFamily: fonts.display,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.medium,
    letterSpacing: -1.5,
    fill: colors.text,
  },
  /** Serif italic accent — numerals, a single word of emphasis. */
  accent: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    fontSize: fontSize.h2,
    fontWeight: fontWeight.regular,
    fill: colors.textMuted,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    fill: colors.text,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: -1,
    fill: colors.text,
  },
  /** Small tracked caps for editorial labels ("01 — BIRTH"). */
  label: {
    fontFamily: fonts.display,
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    letterSpacing: 4,
    fill: colors.text,
  },
} as const satisfies Record<string, TxtProps>;
