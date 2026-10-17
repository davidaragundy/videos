/** Canvas dimensions every video is authored at. */
export const canvas = {
  width: 1920,
  height: 1080,
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

/** Title/action-safe margins (YouTube-friendly), measured from the centre origin. */
export const safe = {
  x: canvas.width / 2 - 120,
  y: canvas.height / 2 - 80,
  top: -(canvas.height / 2 - 80),
  bottom: canvas.height / 2 - 80,
  left: -(canvas.width / 2 - 120),
  right: canvas.width / 2 - 120,
} as const;
