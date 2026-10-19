import {Node} from '@motion-canvas/2d';
import {
  all,
  loop,
  sequence,
  SignalValue,
  SimpleSignal,
  ThreadGenerator,
  TimingFunction,
  unwrap,
  usePlayback,
} from '@motion-canvas/core';
import {duration, ease, STAGGER} from '../theme';

/** Scale from 0 with a little overshoot. The house "something appears" move. */
export function* popIn(
  node: Node,
  time: number = duration.base,
  timing: TimingFunction = ease.pop,
): ThreadGenerator {
  node.scale(0);
  node.opacity(1);
  yield* node.scale(1, time, timing);
}

export function* popOut(node: Node, time: number = duration.fast): ThreadGenerator {
  yield* node.scale(0, time, ease.exit);
  node.opacity(0);
}

/** Fade in while drifting up from `offset` px below the current position. */
export function* fadeUp(
  node: Node,
  time: number = duration.base,
  offset = 40,
): ThreadGenerator {
  const y = node.y();
  node.opacity(0);
  node.y(y + offset);
  yield* all(node.opacity(1, time, ease.enter), node.y(y, time, ease.enter));
}

export function* fadeOut(node: Node, time: number = duration.fast): ThreadGenerator {
  yield* node.opacity(0, time, ease.exit);
}

/** Endless gentle bob. Run with `yield spawn(float(node))` / `yield float(node)`. */
export function* float(node: Node, amplitude = 12, period = 3): ThreadGenerator {
  const y = node.y();
  yield* loop(Infinity, function* () {
    yield* node.y(y - amplitude, period / 2, ease.move);
    yield* node.y(y + amplitude, period / 2, ease.move);
  });
}

/** Endless slow rotation, `degreesPerSecond` clockwise. */
export function* spin(node: Node, degreesPerSecond = 20): ThreadGenerator {
  yield* loop(Infinity, function* () {
    yield* node.rotation(node.rotation() + degreesPerSecond, 1, t => t);
  });
}

/** Run an animation on each node with a fixed delay between starts. */
export function* stagger(
  nodes: Node[],
  animate: (node: Node) => ThreadGenerator,
  delay = STAGGER,
): ThreadGenerator {
  yield* sequence(delay, ...nodes.map(animate));
}

/**
 * Advance a numeric signal forever at `rate` units per second (a signal or function works too,
 * so the speed itself can be animated). Run in the background: `yield drive(wave().phase, 3)`.
 */
export function* drive(
  value: SimpleSignal<number, any>,
  rate: SignalValue<number>,
): ThreadGenerator {
  const dt = usePlayback().framesToSeconds(1);
  while (true) {
    value(value() + unwrap(rate) * dt);
    yield;
  }
}
