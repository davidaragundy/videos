/**
 * Output formats. A video picks one with `defineVideo({format})`; components read the live
 * frame through `useFrame()` so the same code works in both.
 *
 * `safe` insets keep text clear of platform UI: YouTube's player chrome for landscape, and
 * TikTok / Reels / Shorts overlays (top bar, caption + buttons at the bottom, action rail on
 * the right) for vertical.
 */
export const formats = {
  landscape: {
    width: 1920,
    height: 1080,
    safe: {top: 80, bottom: 80, left: 120, right: 120},
  },
  vertical: {
    width: 1080,
    height: 1920,
    safe: {top: 240, bottom: 480, left: 80, right: 160},
  },
} as const;

export type Format = keyof typeof formats;

/** Default (landscape) canvas. Prefer `useFrame()` inside scenes and components. */
export const canvas = {
  width: formats.landscape.width,
  height: formats.landscape.height,
  fps: 60,
} as const;

/** Base spacing unit. Use multiples: `space(3)` → 24px. */
export const UNIT = 8;
export const space = (n: number) => n * UNIT;

/** Corner radii. */
export const radius = {
  sm: 12,
  md: 24,
  lg: 48,
  pill: 999,
} as const;

/** Landscape safe margins measured from the centre origin. Prefer `useFrame().safe`. */
export const safe = {
  x: canvas.width / 2 - formats.landscape.safe.left,
  y: canvas.height / 2 - formats.landscape.safe.top,
  top: -(canvas.height / 2 - formats.landscape.safe.top),
  bottom: canvas.height / 2 - formats.landscape.safe.bottom,
  left: -(canvas.width / 2 - formats.landscape.safe.left),
  right: canvas.width / 2 - formats.landscape.safe.right,
} as const;
