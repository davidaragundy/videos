# CLAUDE.md

Motion Canvas monorepo-style project for Kurzgesagt-like explainer videos. Claude writes scripts,
scenes and animations; the human reviews in the editor and records/approves VO.

## Commands

- `pnpm dev` — editor (Vite). `pnpm typecheck` must pass before finishing any change.
- `pnpm new "Title"` — scaffold a video. `pnpm run list` — status table.
- `pnpm format` — Prettier.

## Rules

- Package manager is **pnpm**. Motion Canvas is pinned to v3 (requires Vite 5). Don't add `"type": "module"` to
  package.json — the Motion Canvas Vite plugin is CJS; Node scripts use `.mts`.
- Follow `docs/style-guide.md`. Never hard-code colours, font sizes, durations or easings in scenes —
  use tokens from `@design`. Missing token? Add it to `src/design/theme/`.
- Reusable visuals/animations go in `src/design/`; video folders hold only video-specific code.
- Scenes import from `@design`; only `project.ts` imports `@design/project` (`defineVideo`).
- `src/design/**` must use relative imports (not `@design`) to avoid cycles.
- One scene file per narrative beat; drive timing with `waitUntil('event')` named in `script.md`.
- Keep `script.md` (VO, visuals, events, sources, status) in sync with the scenes.
- Fact-check science claims and list sources in `script.md`.
