# videos

Kurzgesagt-style animated explainers built with [Motion Canvas](https://motioncanvas.io).
All videos live in one repo and share a single design system: fonts, colours, components, motion and intro/outro.

## Quick start

```bash
pnpm install
pnpm dev            # opens the editor at http://localhost:9000 — pick a video
pnpm new "Why Is the Sky Blue?"   # scaffold videos/00N-why-is-the-sky-blue
pnpm run list       # every video and its production status
pnpm voice 001      # VO from script.md → audio/voiceover.mp3 (ElevenLabs/Fish/OpenAI/Google, or --provider recorded); audio isn't in git, re-run after cloning
pnpm typecheck
```

Render from the editor: **Video Settings → Render** (FFmpeg → MP4, written to `output/`).

## Layout

```
src/
  design/                 ← the shared design system ("@design")
    theme/                  colours, typography, layout grid, motion tokens
    components/             Background, Starfield, Planet, Title, Label, Caption…
    animations/             popIn, fadeUp, float, spin, stagger…
    scenes/                 shared titleCard + endCard scenes
    project.ts              defineVideo() — wraps makeProject with the house defaults
  styles/fonts.css        bundled fonts (Outfit + Nunito via Fontsource)
videos/
  001-why-do-stars-shine/
    project.ts              defineVideo({...}) — title, scenes, audio
    project.meta            editor settings (1920×1080, 60 fps, FFmpeg)
    script.md               script, VO lines, timing events, sources, status
    scenes/                 one file per beat: 01-fusion.tsx, 02-…
    assets/  audio/         video-specific images, SVGs, voiceover
templates/video/          what `pnpm new` copies
scripts/                  repo tooling (new-video, list-videos, voice)
docs/                     style guide + production workflow
```

Imports: scenes use `import {Planet, popIn, colors} from '@design'`; only `project.ts` files import `@design/project`.

See [docs/style-guide.md](docs/style-guide.md) and [docs/workflow.md](docs/workflow.md).
