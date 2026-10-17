# Production workflow

Each video moves through statuses tracked in `script.md` front-matter:
`draft → scripted → voiced → animated → rendered → published`.

1. **Scaffold** — `pnpm new "Title"` creates `videos/00N-slug/` from `templates/video`.
2. **Script** — write `script.md`: hook, then one section per scene with VO lines, visuals and the
   timing **event** names that scene will `waitUntil(...)`. Add sources.
3. **Voiceover** — drop the recording in `audio/` (e.g. `voiceover.wav`), import it in `project.ts`
   and pass it as `audio`.
4. **Animate** — one scene file per beat in `scenes/` (`01-…`, `02-…`), registered in `project.ts`.
   Build from `@design` components/animations. If you need a new reusable piece, add it to
   `src/design/` instead of the video folder.
5. **Sync** — in the editor, drag each event marker on the timeline to the matching VO moment.
   Positions are saved to the scene's `.meta` file (commit it).
6. **Render** — Video Settings → Render. MP4 lands in `output/<project>/`.

## Notes

- Shared scenes (`src/design/scenes/*`) have one `.meta` file used by every video, so don't
  rely on per-video timing events there — use project `variables` instead.
- Put large raw recordings in `videos/*/audio/raw/` (git-ignored); commit only final, compressed audio.
- `project.meta` controls resolution, fps and exporter. The template sets 1920×1080 @ 60 fps
  render / 30 fps preview with the FFmpeg exporter.
