import type {Captions} from '../components/Captions';
import {
  ThreadGenerator,
  useLogger,
  usePlayback,
  useScene,
  useThread,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import {CAPTION_HOLD} from '../theme';

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
  yield* waitForCue(event, offset, 'start');
}

/**
 * Like `waitForVO`, but waits until the VO line for `event` has finished — e.g. to hold the
 * last shot of a video until the narrator stops talking.
 */
export function* waitForVOEnd(event: string, offset = 0): ThreadGenerator {
  yield* waitForCue(event, offset, 'end');
}

function* waitForCue(
  event: string,
  offset: number,
  edge: 'start' | 'end',
): ThreadGenerator {
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

  const wait = cue[edge] + offset - projectTime();
  if (wait < -usePlayback().framesToSeconds(1)) {
    useLogger().warn(
      `waitForVO: "${event}" is ${(-wait).toFixed(2)}s late — the animation before it in ` +
        `${scene.name} runs past the VO line. Shorten it so visuals match the voice.`,
    );
  }
  yield* waitFor(Math.max(0, wait));
}

/**
 * Subtitles straight from the voiceover, short-form style: each of this scene's VO lines is
 * split into chunks of a few words, shown while spoken, with the current word highlighted.
 * Word times are estimated from letter counts inside each line's exact start/end, so they
 * follow any voice closely. Run in the background: `yield voCaptions(captions());`.
 * Does nothing until the video has a `voiceover.json`.
 */
export function* voCaptions(captions: Captions): ThreadGenerator {
  const voiceover = useVoiceover();
  if (!voiceover) return;
  const scene = useScene();
  const lines = voiceover.events.filter(e => e.scene === scene.name);
  captions.opacity(0);

  for (const [i, line] of lines.entries()) {
    const {words, starts} = wordTimes(line);

    for (const chunk of chunkWords(words)) {
      yield* waitFor(Math.max(0, starts[chunk.from] - projectTime()));
      yield* captions.show(words.slice(chunk.from, chunk.to));
      for (let w = chunk.from; w < chunk.to; w++) {
        yield* waitFor(Math.max(0, starts[w] - projectTime()));
        captions.highlight(w - chunk.from);
      }
    }
    yield* waitFor(Math.max(0, line.end - projectTime()));
    captions.highlight(-1);
    const next = lines[i + 1];
    if (!next || next.start - line.end > CAPTION_HOLD) yield* captions.hide();
  }
}

/**
 * Wait until a given word of an event's VO line is spoken (first match, case-insensitive,
 * punctuation ignored), e.g. `waitForVOWord('grow', 'distance')`. Word times are estimated
 * from letter counts within the line, so expect ±0.2 s.
 */
export function* waitForVOWord(event: string, word: string, offset = 0): ThreadGenerator {
  const voiceover = useVoiceover();
  const scene = useScene();
  const line =
    voiceover?.events.find(e => e.event === event && e.scene === scene.name) ??
    voiceover?.events.find(e => e.event === event);
  if (!line) {
    yield* waitForVO(event, offset);
    return;
  }
  const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const {words, starts} = wordTimes(line);
  const i = words.findIndex(w => clean(w) === clean(word));
  if (i < 0) {
    useLogger().warn(`waitForVOWord: "${word}" is not in the "${event}" line.`);
    yield* waitForVO(event, offset);
    return;
  }
  yield* waitFor(Math.max(0, starts[i] + offset - projectTime()));
}

/** Estimated start time of each word in a VO line: longer words take longer, punctuation adds a breath. */
function wordTimes(line: {text: string; start: number; end: number}) {
  const words = line.text.split(/\s+/).filter(Boolean);
  const weights = words.map(
    w => w.replace(/[^\p{L}\p{N}]/gu, '').length + 2 + (/[,.;:!?…—]$/.test(w) ? 3 : 0),
  );
  const total = weights.reduce((a, b) => a + b, 0);
  const span = line.end - line.start;
  let acc = 0;
  const starts = weights.map(w => {
    const t = line.start + (acc / total) * span;
    acc += w;
    return t;
  });
  return {words, starts};
}

/** Group words into caption chunks: ≤ 4 words / ~22 letters, breaking after punctuation. */
function chunkWords(words: string[]) {
  const chunks: {from: number; to: number}[] = [];
  let from = 0;
  let letters = 0;
  words.forEach((word, i) => {
    letters += word.length + 1;
    const end =
      i === words.length - 1 ||
      i - from + 1 >= 4 ||
      letters + words[i + 1].length > 22 ||
      /[,.;:!?…—]$/.test(word);
    if (end) {
      chunks.push({from, to: i + 1});
      from = i + 1;
      letters = 0;
    }
  });
  return chunks;
}

function useVoiceover() {
  return useScene().variables.get<Voiceover | null>(VOICEOVER_VARIABLE, null)();
}

/** Current time in seconds on the whole project timeline (not just this scene). */
function projectTime() {
  return usePlayback().framesToSeconds(useScene().firstFrame) + useThread().time();
}
