import {
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  easeOutElastic,
} from '@motion-canvas/core';

/** Standard durations in seconds. */
export const duration = {
  instant: 0.15,
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
  scene: 0.8, // scene transitions
} as const;

/** Named easings so every video moves with the same personality. */
export const ease = {
  enter: easeOutCubic,
  exit: easeInCubic,
  move: easeInOutCubic,
  pop: easeOutBack,
  bounce: easeOutElastic,
} as const;

/** Keep a VO caption on screen through pauses up to this long before hiding it (seconds). */
export const CAPTION_HOLD = 0.8;

/** Default delay between items in a staggered entrance. */
export const STAGGER = 0.08;
