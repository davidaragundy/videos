# Production workflow

Each video moves through statuses tracked in `script.md` front-matter:
`draft → scripted → voiced → animated → rendered → published`.

1. **Scaffold** — `pnpm new "Title"` creates `videos/00N-slug/` from `templates/video`.
2. **Script** — write `script.md`: hook, then one section per scene with VO lines, visuals and the
   timing **event** names that scene will `waitUntil(...)`. Add sources.
3. **Voiceover** — either drop a recording in `audio/` (e.g. `voiceover.wav`), or generate one:
   `pnpm voice <slug>` sends each VO line to a TTS provider and writes `audio/voiceover.mp3`.
   Import the file in `project.ts` and pass it as `audio`.
   - Providers: `elevenlabs` (default), `fish` (Fish Audio — free `s2.1-pro-free` model by
     default), `openai`, `google` (Google Cloud TTS, has a free monthly quota). Pick one with
     `--provider`, `voice_provider:` in `script.md` front-matter, or `VOICE_PROVIDER` in `.env`.
     Each needs its `<PROVIDER>_API_KEY` in `.env` — see `.env.example`.
   - Per-video voice: `voice_id:` / `model_id:` in front-matter override `.env` (they apply only
     to the `voice_provider:` they sit next to). `voice_style:` gives OpenAI a delivery direction.
   - VO lines come from the `| Event | VO | Visuals |` tables (or `**VO:**` lines, paired in order
     with the section's `**Events:**`). `—` / `…` cells are skipped.
   - Each line is cached as `audio/lines/<provider>/<nn>-<event>.mp3`; only changed lines are
     regenerated (`--force` redoes all), and switching providers keeps the other caches. Clips
     are joined with `--gap 0.4` s pauses after `--intro 4` s of silence so the VO starts after
     the shared title card.
   - It prints each event's start time on the project timeline and writes
     `audio/voiceover.json`, which scenes use to sync themselves (step 5).
   - `pnpm voice <slug> --dry-run` shows the parsed lines without calling the API.
   - **Your own voice:** `--provider recorded` (or `voice_provider: recorded`) skips TTS and
     uses one take per line from `audio/lines/recorded/<nn>-<event>.<wav|m4a|mp3|…>`.
     `--dry-run` prints the recording checklist (✔ recorded, · still to do) with the exact
     file names. Silence at the start/end of each take is trimmed so the gaps stay even
     (`--no-trim` to keep it). If a script line changes after you recorded it, you get a
     warning until you re-record that take (or pass `--force`).
4. **Animate** — one scene file per beat in `scenes/` (`01-…`, `02-…`), registered in `project.ts`.
   Build from `@design` components/animations. If you need a new reusable piece, add it to
   `src/design/` instead of the video folder.
5. **Sync** — in scenes, wait for VO lines with `yield* waitForVO('event')` (from `@design`) and
   pass `voiceover.json` to `defineVideo({voiceover})` in `project.ts`. Each cue then waits until
   that line starts in the audio, so regenerating or re-recording the VO needs no re-syncing.
   - Times are absolute on the project timeline, so the title card and earlier scenes can be any
     length. Leave the project's **audio offset** at 0.
   - `waitForVO('event', -0.3)` starts the visuals 0.3 s before the words (or later with `+`).
   - If an animation runs past its next VO line, the editor logs a "late" warning: shorten it.
   - Beats with no VO line (e.g. `end`) and videos with no `voiceover.json` yet use
     `waitUntil('event')` markers: drag them on the timeline; positions are saved to the scene's
     `.meta` file (commit it). `waitForVO` falls back to such a marker when there's no VO data.
     Once VO is wired in, the editor drops the old markers for VO-synced events from `.meta`.
6. **Render** — Video Settings → Render. MP4 lands in `output/<project>/`.

## Notes

- Shared scenes (`src/design/scenes/*`) have one `.meta` file used by every video, so don't
  rely on per-video timing events there — use project `variables` instead.
- **Audio is not in git.** Everything under `videos/*/audio/` is ignored except
  `voiceover.json` (provider, voice, model and event times). After cloning, run
  `pnpm voice <slug>` before opening a video that imports `voiceover.mp3`, or the editor shows a
  missing-file error. Regenerated TTS has slightly different timing; `waitForVO` scenes follow it
  automatically (`git diff voiceover.json` shows what moved). Your own
  takes in `audio/lines/recorded/` exist only on your machine — back them up outside git.
- `project.meta` controls resolution, fps and exporter. The template sets 1920×1080 @ 60 fps
  render / 30 fps preview with the FFmpeg exporter.
