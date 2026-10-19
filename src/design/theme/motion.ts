import {
  createEaseOutBack,
  easeInOutCubic,
  easeInQuart,
  easeOutElastic,
  easeOutQuart,
} from '@motion-canvas/core';

/** Standard durations in seconds. Unhurried — premium motion settles, it doesn't snap. */
export const duration = {
  instant: 0.15,
  fast: 0.35,
  base: 0.7,
  slow: 1.4,
  scene: 0.6, // wave-wipe transitions
} as const;

/** Named easings so every video moves with the same personality. */
export const ease = {
  enter: easeOutQuart,
  exit: easeInQuart,
  move: easeInOutCubic,
  /** Gentle overshoot — a settle, not a bounce. */
  pop: createEaseOutBack(1.1),
  bounce: easeOutElastic,
} as const;

/** Default delay between items in a staggered entrance. */
export const STAGGER = 0.09;

/** Captions stay up through pauses shorter than this (seconds) instead of blinking off. */
export const CAPTION_HOLD = 0.8;
