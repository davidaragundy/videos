import {Node, Txt} from '@motion-canvas/2d';
import {
  ThreadGenerator,
  useLogger,
  usePlayback,
  useScene,
  useThread,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import {CAPTION_HOLD, duration, ease} from '../theme';

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
  const voiceover = useVoiceover();
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

  const wait = cue.start + offset - projectTime();
  if (wait < -usePlayback().framesToSeconds(1)) {
    useLogger().warn(
      `waitForVO: "${event}" is ${(-wait).toFixed(2)}s late — the animation before it in ` +
        `${scene.name} runs past the VO line. Shorten it so visuals match the voice.`,
    );
  }
  yield* waitFor(Math.max(0, wait));
}

/**
 * Subtitles straight from the voiceover: shows each of this scene's VO lines in `caption` exactly
 * while it is spoken, and hides the caption box in pauses longer than `CAPTION_HOLD`.
 * Run it in the background at the top of a scene: `yield voCaptions(caption());`.
 * Does nothing until the video has a `voiceover.json`.
 */
export function* voCaptions(caption: Txt): ThreadGenerator {
  const voiceover = useVoiceover();
  if (!voiceover) return;
  const scene = useScene();
  const lines = voiceover.events.filter(e => e.scene === scene.name);
  // Fade the caption's box (its parent) so no empty pill is left on screen.
  const box: Node = caption.parent() ?? caption;
  box.opacity(0);

  for (const [i, line] of lines.entries()) {
    yield* waitFor(Math.max(0, line.start - projectTime()));
    caption.text(line.text);
    yield* box.opacity(1, duration.instant, ease.enter);
    yield* waitFor(Math.max(0, line.end - projectTime()));
    const next = lines[i + 1];
    if (!next || next.start - line.end > CAPTION_HOLD) {
      yield* box.opacity(0, duration.instant, ease.exit);
    }
  }
}

function useVoiceover() {
  return useScene().variables.get<Voiceover | null>(VOICEOVER_VARIABLE, null)();
}

/** Current time in seconds on the whole project timeline (not just this scene). */
function projectTime() {
  return usePlayback().framesToSeconds(useScene().firstFrame) + useThread().time();
}
