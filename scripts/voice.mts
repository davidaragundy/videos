/**
 * Turn a video's script.md VO lines into `audio/voiceover.mp3` via a TTS provider
 * (ElevenLabs, Fish Audio, OpenAI or Google — see `voice-providers.mts`), or from your own
 * per-line recordings with `--provider recorded`.
 *
 *   pnpm voice <slug> [--provider fish] [--dry-run] [--force] [--intro 4] [--gap 0.4]
 *
 * One clip per VO line is cached in `audio/lines/<provider>/` (regenerated only when the text
 * or voice changes), then everything is concatenated with ffmpeg after `--intro` seconds of silence so
 * the VO starts after the shared title card. Event timestamps are printed and written to
 * `audio/voiceover.json`.
 */
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {join, resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {
  providerIds,
  providers,
  type Provider,
  type ProviderId,
} from './voice-providers.mjs';

const root = resolve(import.meta.dirname, '..');
const RECORDED = 'recorded';
const RECORDING_EXTS = ['wav', 'm4a', 'mp3', 'aif', 'aiff', 'flac', 'ogg', 'webm'];
// Trims silence from both ends of a take so the --gap between lines stays consistent.
const TRIM_SILENCE =
  'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,' +
  'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse';

const usage = `Usage: pnpm voice <video-slug> [options]

Options:
  --provider <p> ${[...providerIds, RECORDED].join(' | ')} (default: script.md
                 \`voice_provider:\`, then VOICE_PROVIDER in .env, then elevenlabs)
                 recorded = your own takes in audio/lines/recorded/<nn>-<event>.<wav|m4a|mp3…>
  --dry-run      Print the parsed VO lines and exit (no API key or network needed)
  --force        Regenerate every clip, ignoring the cache
  --no-trim      recorded: keep the silence at the start/end of each take
  --intro <s>    Silence before the first line, matching the title card (default:
                 front-matter \`vo_intro:\`, else 4)
  --gap <s>      Silence between lines (default: \`vo_gap:\`, else 0.4)
  --tail <s>     Silence after the last line (default: \`vo_tail:\`, else 30). The FFmpeg exporter stops at the
                 shorter of video/audio, so this keeps the end card from being cut off.
  -h, --help     Show this help`;

const fail = (message: string): never => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const {values: opts, positionals} = parseArgs({
  allowPositionals: true,
  options: {
    provider: {type: 'string'},
    'dry-run': {type: 'boolean', default: false},
    force: {type: 'boolean', default: false},
    'no-trim': {type: 'boolean', default: false},
    intro: {type: 'string'},
    gap: {type: 'string'},
    tail: {type: 'string'},
    help: {type: 'boolean', short: 'h', default: false},
  },
});

if (opts.help) {
  console.log(usage);
  process.exit(0);
}

const seconds = (name: string, raw: string) => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0)
    fail(`--${name} must be a number of seconds, got "${raw}".`);
  return n;
};

// ---------------------------------------------------------------------------------------------
// Locate the video

const query = positionals[0];
if (!query) fail(`Missing video slug.\n\n${usage}`);
const videosDir = join(root, 'videos');
const slugs = readdirSync(videosDir).filter(d =>
  existsSync(join(videosDir, d, 'script.md')),
);
const slug = slugs.includes(query) ? query : slugs.find(s => s.startsWith(`${query}-`));
if (!slug) fail(`No video "${query}". Available: ${slugs.join(', ') || '(none)'}`);
const videoDir = join(videosDir, slug!);
const script = readFileSync(join(videoDir, 'script.md'), 'utf8');

// ---------------------------------------------------------------------------------------------
// Config: .env, then script.md front-matter overrides

function loadEnv(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadEnv(join(root, '.env'));

const frontMatter = script.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const field = (key: string) =>
  frontMatter.match(new RegExp(`^${key}:\\s*'?([^'\\n#]*)'?`, 'm'))?.[1]?.trim() ||
  undefined;

const env = (key: string) => process.env[key]?.trim() || undefined;

// Pacing: flag, then `vo_intro:` / `vo_gap:` / `vo_tail:` in front-matter, then defaults.
const intro = seconds('intro', opts.intro ?? field('vo_intro') ?? '4');
const gap = seconds('gap', opts.gap ?? field('vo_gap') ?? '0.4');
const tail = seconds('tail', opts.tail ?? field('vo_tail') ?? '30');

const providerId = (
  opts.provider ??
  field('voice_provider') ??
  env('VOICE_PROVIDER') ??
  'elevenlabs'
).toLowerCase() as ProviderId | typeof RECORDED;
const recorded = providerId === RECORDED;
if (!recorded && !providerIds.includes(providerId)) {
  fail(
    `Unknown provider "${providerId}". Choose one of: ${[...providerIds, RECORDED].join(', ')}`,
  );
}
const provider = recorded
  ? {label: 'your recordings', env: '', defaultVoice: '', defaultModel: ''}
  : providers[providerId];
// voice_id / model_id in front-matter only apply to the provider they were written for.
const ownsFrontMatter = (field('voice_provider') ?? providerId) === providerId;
const voiceId =
  (ownsFrontMatter ? field('voice_id') : undefined) ??
  env(`${provider.env}_VOICE_ID`) ??
  provider.defaultVoice;
const modelId =
  (ownsFrontMatter ? field('model_id') : undefined) ??
  env(`${provider.env}_MODEL_ID`) ??
  provider.defaultModel;
const style = field('voice_style') ?? env('VOICE_STYLE');

// ---------------------------------------------------------------------------------------------
// Parse VO lines

interface Line {
  scene: string;
  event: string;
  text: string;
}

const isEmpty = (text: string) => /^[\s—–\-…\.]*$/.test(text);
const cleanText = (md: string) =>
  md
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*|__|[*_]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(c => c.trim());

function parseLines(md: string): Line[] {
  const body = md.replace(/^---\n[\s\S]*?\n---\n/, '');
  const lines: Line[] = [];
  let scene = '';
  let table: {event: number; vo: number} | null = null;
  // `**VO:**` sections: collected per scene, then paired with that scene's `**Events:**` list.
  let pending: {text: string; scene: string}[] = [];
  let events: string[] = [];

  const flushPending = () => {
    pending.forEach((p, i) => {
      const event = events[i] ?? `${p.scene}${pending.length > 1 ? `-${i + 1}` : ''}`;
      lines.push({scene: p.scene, event, text: p.text});
    });
    pending = [];
    events = [];
  };

  for (const raw of body.split('\n')) {
    const heading = raw.match(/^##\s+(.*)$/);
    if (heading) {
      flushPending();
      table = null;
      // "01 — fusion (`scenes/01-fusion.tsx`)" → "01-fusion"
      const title = heading[1].replace(/\(.*\)/, '').trim();
      scene = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      continue;
    }
    if (!scene || /^(hook|sources?|notes?)$/.test(scene)) continue;

    if (raw.trim().startsWith('|')) {
      const row = cells(raw);
      if (!table) {
        const lower = row.map(c => c.toLowerCase());
        const event = lower.indexOf('event');
        const vo = lower.indexOf('vo');
        if (event >= 0 && vo >= 0) table = {event, vo};
        continue;
      }
      if (row.every(c => /^:?-+:?$/.test(c))) continue; // separator
      const text = cleanText(row[table.vo] ?? '');
      const event = cleanText(row[table.event] ?? '');
      if (event && !isEmpty(text)) lines.push({scene, event, text});
      continue;
    }
    table = null;

    const vo = raw.match(/^\s*\*\*VO:?\*\*:?\s*(.*)$/i);
    if (vo) {
      const text = cleanText(vo[1]);
      if (!isEmpty(text)) pending.push({text, scene});
      continue;
    }
    const ev = raw.match(/^\s*\*\*Events?:?\*\*:?\s*(.*)$/i);
    if (ev) events = [...ev[1].matchAll(/`([^`]+)`/g)].map(m => m[1]);
  }
  flushPending();
  return lines;
}

const lines = parseLines(script);
if (lines.length === 0) {
  fail(
    `No VO lines found in videos/${slug}/script.md.\n` +
      '  Use an "| Event | VO | Visuals |" table or "**VO:** …" lines under each "## NN — scene" heading.',
  );
}

const baseName = (line: Line, i: number) =>
  `${String(i + 1).padStart(2, '0')}-${line.event.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
const fileName = (line: Line, i: number) => `${baseName(line, i)}.mp3`;

const linesDir = join(videoDir, 'audio', 'lines', providerId);
const cachePath = join(linesDir, 'cache.json');
const cache: Record<string, string> = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, 'utf8'))
  : {};
const saveCache = () => writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
const hashOf = (text: string) =>
  createHash('sha256')
    .update(JSON.stringify(recorded ? {text} : {text, voiceId, modelId, style}))
    .digest('hex')
    .slice(0, 16);

/** recorded: the take for a line, whatever format it was saved in. */
const recordingOf = (line: Line, i: number) =>
  RECORDING_EXTS.map(ext => `${baseName(line, i)}.${ext}`).find(f =>
    existsSync(join(linesDir, f)),
  );

const voiceInfo = recorded
  ? `audio/lines/${RECORDED}/`
  : `voice ${voiceId || '(default)'}${modelId ? ` · model ${modelId}` : ''}`;
console.log(
  `\n${slug} — ${lines.length} VO line(s) · ${provider.label} · ${voiceInfo}\n`,
);
lines.forEach((l, i) => {
  const name = recorded ? (recordingOf(l, i) ?? `${baseName(l, i)}.wav`) : fileName(l, i);
  const mark = recorded ? (recordingOf(l, i) ? '✔ ' : '· ') : '';
  console.log(`  ${mark}${name.padEnd(24)} [${l.scene}] ${l.text}`);
});

if (opts['dry-run']) {
  if (recorded) {
    mkdirSync(linesDir, {recursive: true});
    console.log(
      `\n  ✔ = take found, · = still to record. Save each take (wav, m4a, mp3…) in\n` +
        `  videos/${slug}/audio/lines/${RECORDED}/ with the name shown, then run without --dry-run.`,
    );
  }
  console.log('\n(dry run — nothing generated)\n');
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// Collect clips: your recordings, or TTS (cached by text + voice settings)

let clipFiles: string[];
if (recorded) {
  const missing = lines.filter((l, i) => !recordingOf(l, i));
  if (missing.length > 0) {
    fail(
      `${missing.length} of ${lines.length} take(s) not recorded yet in videos/${slug}/audio/lines/${RECORDED}/:\n` +
        missing
          .map(l => `  · ${baseName(l, lines.indexOf(l))}.wav — ${l.text}`)
          .join('\n') +
        `\n  (pnpm voice ${slug} --provider ${RECORDED} --dry-run shows the full checklist.)`,
    );
  }
  clipFiles = lines.map((l, i) => recordingOf(l, i)!);
  // Warn when the script line changed but the take didn't (cache: "<text hash>:<file mtime>").
  lines.forEach((l, i) => {
    const file = clipFiles[i];
    const hash = hashOf(l.text);
    const mtime = String(Math.round(statSync(join(linesDir, file)).mtimeMs));
    const [oldHash, oldMtime] = (cache[file] ?? '').split(':');
    if (oldHash && oldHash !== hash && oldMtime === mtime && !opts.force) {
      console.warn(
        `  ⚠ ${file}: script text changed since this take — re-record it, or pass --force to accept`,
      );
    } else cache[file] = `${hash}:${mtime}`;
  });
  const used = new Set(clipFiles);
  for (const file of Object.keys(cache)) if (!used.has(file)) delete cache[file];
  saveCache();
  console.log(
    `\n  ${lines.length} take(s) found${opts['no-trim'] ? '' : ', trimming edge silence'}`,
  );
} else {
  const tts: Provider = providers[providerId as ProviderId];
  mkdirSync(linesDir, {recursive: true});
  const todo = lines
    .map((line, i) => ({line, file: fileName(line, i), hash: hashOf(line.text)}))
    .filter(
      ({file, hash}) =>
        opts.force || cache[file] !== hash || !existsSync(join(linesDir, file)),
    );

  const keyVar = `${tts.env}_API_KEY`;
  const apiKey = env(keyVar);
  if (todo.length > 0 && !apiKey) {
    fail(
      `${keyVar} is not set (${todo.length} ${tts.label} clip(s) need generating).\n` +
        '  1. cp .env.example .env   (if you have no .env yet)\n' +
        `  2. Set ${keyVar}= — get a key at ${tts.keyUrl}\n` +
        `  3. Re-run: pnpm voice ${slug}${opts.provider ? ` --provider ${providerId}` : ''}\n` +
        '  (Use --dry-run to check the parsed lines without a key.)',
    );
  }

  for (const {line, file, hash} of todo) {
    process.stdout.write(`\n  ↻ generating ${file} …`);
    try {
      const audio = await tts.synthesize(line.text, {
        apiKey: apiKey!,
        voice: voiceId,
        model: modelId,
        style,
      });
      writeFileSync(join(linesDir, file), audio);
    } catch (error) {
      saveCache();
      fail(`${tts.label} request failed for ${file}: ${(error as Error).message}`);
    }
    cache[file] = hash;
    saveCache();
  }
  if (todo.length > 0) process.stdout.write('\n');
  console.log(`\n  ${lines.length - todo.length} cached, ${todo.length} generated`);

  // Drop clips from lines that no longer exist (only files this script created).
  const current = new Set(lines.map(fileName));
  for (const file of Object.keys(cache)) {
    if (current.has(file)) continue;
    rmSync(join(linesDir, file), {force: true});
    delete cache[file];
  }
  saveCache();
  clipFiles = lines.map(fileName);
}

// ---------------------------------------------------------------------------------------------
// Measure + concatenate

function run(args: string[]) {
  const r = spawnSync(ffmpeg.path, ['-hide_banner', ...args], {encoding: 'utf8'});
  if (r.status !== 0)
    fail(`ffmpeg failed:\n${r.stderr.split('\n').slice(-15).join('\n')}`);
  return r.stderr;
}

/** Exact duration by decoding the file (mp3 headers alone can be off). */
function durationOf(file: string, filter = '') {
  const af = filter ? ['-af', filter.replace(/,$/, '')] : [];
  const log = run(['-i', file, ...af, '-f', 'null', '-']);
  const times = [...log.matchAll(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/g)];
  const last = times.at(-1);
  if (!last) fail(`Could not read the duration of ${file}`);
  return Number(last![1]) * 3600 + Number(last![2]) * 60 + Number(last![3]);
}

const clipFilter = recorded && !opts['no-trim'] ? `${TRIM_SILENCE},` : '';
const clips = lines.map((line, i) => {
  const path = join(linesDir, clipFiles[i]);
  return {line, path, duration: durationOf(path, clipFilter)};
});

const inputs = ['-f', 'lavfi', '-t', String(intro), '-i', 'anullsrc=r=44100:cl=mono'];
const filters = ['[0:a]aformat=sample_rates=44100:channel_layouts=mono[s0]'];
clips.forEach((clip, i) => {
  inputs.push('-i', clip.path);
  const pad = `,apad=pad_dur=${i < clips.length - 1 ? gap : tail}`;
  filters.push(
    `[${i + 1}:a]${clipFilter}aformat=sample_rates=44100:channel_layouts=mono${pad}[s${i + 1}]`,
  );
});
const labels = clips.map((_, i) => `[s${i + 1}]`).join('');
filters.push(`[s0]${labels}concat=n=${clips.length + 1}:v=0:a=1[out]`);

const outPath = join(videoDir, 'audio', 'voiceover.mp3');
run([
  '-y',
  ...inputs,
  '-filter_complex',
  filters.join(';'),
  '-map',
  '[out]',
  '-c:a',
  'libmp3lame',
  '-b:a',
  '192k',
  outPath,
]);

// ---------------------------------------------------------------------------------------------
// Timestamps

const fmt = (t: number) => {
  const m = Math.floor(t / 60);
  return `${m}:${(t - m * 60).toFixed(2).padStart(5, '0')}`;
};

let t = intro;
const events = clips.map((clip, i) => {
  const start = t;
  t += clip.duration + (i < clips.length - 1 ? gap : 0);
  return {
    scene: clip.line.scene,
    event: clip.line.event,
    start: Number(start.toFixed(3)),
    end: Number((start + clip.duration).toFixed(3)),
    file: `lines/${providerId}/${clipFiles[i]}`,
    text: clip.line.text,
  };
});

writeFileSync(
  join(videoDir, 'audio', 'voiceover.json'),
  JSON.stringify(
    {
      provider: providerId,
      voiceId,
      modelId,
      intro,
      gap,
      duration: Number(t.toFixed(3)),
      events,
    },
    null,
    2,
  ) + '\n',
);

console.log(`\n  ✔ videos/${slug}/audio/voiceover.mp3 (${fmt(t)})`);
console.log('    Event timestamps (project timeline) → also in audio/voiceover.json:\n');
let lastScene = '';
for (const e of events) {
  if (e.scene !== lastScene) console.log(`    ${e.scene}`);
  lastScene = e.scene;
  console.log(`      ${fmt(e.start).padStart(8)}  ${e.event}`);
}
console.log(
  `\n  Next (once per video): in project.ts import './audio/voiceover.mp3' as \`audio\` and` +
    "\n  './audio/voiceover.json' as \`voiceover\`. Scenes using waitForVO('event') then follow" +
    '\n  the VO automatically — no markers to drag.\n',
);
