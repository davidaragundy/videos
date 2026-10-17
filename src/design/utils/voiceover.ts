import {
  ThreadGenerator,
  useLogger,
  usePlayback,
  useScene,
  useThread,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';

/** Shape of `audio/voiceover.json`, written by `pnpm voice`. */
export interface Voiceover {
  provider: string;
  intro: number;
  gap: number;
  duration: number;
  events: {
    scene: string;
    event: string;
    /** Seconds from the start of the project timeline. */
    start: number;
    end: number;
    text: string;
  }[];
}

/** Project variable `defineVideo` stores the voiceover timing under. */
export const VOICEOVER_VARIABLE = 'voiceover';

/**
 * Wait until the VO line for `event` starts in the voiceover, so visuals stay in sync after the
 * VO is regenerated — no event markers to drag.
 *
 * Times come from `audio/voiceover.json` (pass it to `defineVideo({voiceover})`). They are
 * absolute, so the title card and earlier scenes can be any length. `offset` shifts the cue in
 * seconds; negative values start the visuals just before the words.
 *
 * Without voiceover data (or for an event with no VO line) this falls back to
 * `waitUntil(event)`, i.e. an editor marker you drag by hand.
 */
export function* waitForVO(event: string, offset = 0): ThreadGenerator {
  const scene = useScene();
  const voiceover = scene.variables.get<Voiceover | null>(VOICEOVER_VARIABLE, null)();
  // Prefer this scene's line (event names may repeat across scenes), then any scene.
  const cue =
    voiceover?.events.find(e => e.event === event && e.scene === scene.name) ??
    voiceover?.events.find(e => e.event === event);

  if (!cue) {
    if (voiceover) {
      useLogger().warn(
        `waitForVO: no VO line "${event}" in voiceover.json — using the editor marker instead.`,
      );
    }
    yield* waitUntil(event);
    return;
  }

  const playback = usePlayback();
  const now = playback.framesToSeconds(scene.firstFrame) + useThread().time();
  const wait = cue.start + offset - now;
  if (wait < -playback.framesToSeconds(1)) {
    useLogger().warn(
      `waitForVO: "${event}" is ${(-wait).toFixed(2)}s late — the animation before it in ` +
        `${scene.name} runs past the VO line. Shorten it so visuals match the voice.`,
    );
  }
  yield* waitFor(Math.max(0, wait));
}
