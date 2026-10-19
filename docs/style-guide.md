# Style guide

The one design line every video follows. Tokens live in `src/design/theme/` — change them there, never inline.

**Coastal editorial**: a mid-century beach poster that moves. Think risograph print, not
neon explainer. Flat, rounded, paper-cut shapes, sun-faded colour, film grain and confident
editorial type. If a frame wouldn't work as a printed poster, it isn't done.

## Colour

- Palette (`palette.*`): earth (`terracotta`, `clay`, `ink`), light grounds (`paper`, `cream`,
  `sand`), warm accents (`apricot`, `orange`, `sun`, `coral`, `blush`), sea (`seaDeep`, `sea`,
  `seaLight`, `foam`, `sage`). No pure white or black, nothing neon.
- One ground per shot: either a dark one (terracotta, sea, ink) with cream text, or a light
  one (paper, cream, sand) with ink/terracotta text. Gradients are subtle: `terracotta`,
  `cream`, `beach`, `sunset`, `sea`, `ink`.
- Max ~3 accent hues per frame. Semantic roles: `colors.text` (on dark), `colors.textDark` (on light).

## Shapes & finish

- Flat fills, rounded corners, **no outlines** (thin strokes only for diagrams and annotations).
- Depth comes from **layering**: stacked bands like cut paper (`Sea` layers, a cream foam lip
  behind the front wave, a sand strip above a clay seabed). There's no glow and no gradient shading.
- Poster props: `Sun` (striped retro disc), `Cloud`, birds, rounded rain and wind strokes.
- Every scene ends with `<Grain />` (film grain + vignette) as its last visual layer. Most of
  the "expensive" feel comes from it.

## Type

- Display/body: **Inter Tight**, medium weight, tight tracking (`text.hero/h1/h2/h3`).
  Accent: **Instrument Serif italic** (`text.accent`, `fonts.serif`) for numerals and a single
  emphasised word ("_an ocean._", "_energy_", "_i. ii. iii._").
- Headlines are left-aligned, stacked short lines, upper-left of the frame, like the poster.
- Labels: tracked caps (`text.label`); `ChapterTag` runs up the left edge ("01 —— BIRTH").
- Maths is LaTeX (`Formula`): ink on light grounds, cream on dark. Use `rows` for fractions.

## Captions

- `<Captions />` + `yield voCaptions(captions())`: 3–4 words at a time, no box, with the spoken
  word highlighted (apricot on dark, coral on light). `tone="dark"` on light grounds.
- They sit low in the frame, just above the platform's own caption area.

## Transitions

- The signature cut is the **wave wipe** (`Wipe`): end a scene with `yield* wipe().cover()`
  (~0.8 s before the next scene's first line) and open the next with `wipe().covered()` +
  `yield wipe().reveal()`.

## Layout

- Origin at the centre. Spacing is in 8px units: `space(n)`. Keep text inside `useFrame().safe`.

## Formats

- `defineVideo({format: 'landscape'})` → 1920×1080 for YouTube (default), `'vertical'` → 1080×1920
  for TikTok / Reels / Shorts. Scaffold with `pnpm new "Title" --vertical`.
- Lay things out with `useFrame()` (size, `safe` edges, `center`), never hard-coded canvas sizes.
  Vertical safe insets keep text clear of platform UI: 240 px top, 480 px bottom, 160 px right.
- `Background`, `Starfield`, `Captions`, `Grain`, `Wipe`, `Label` and `ChapterTag` adapt to the format on their own.

### Short-form (vertical) rules

- **Hook in the first 1–2 s:** motion on frame 0 plus a bold on-screen claim that opens a
  question. No title card, no outro card (vertical videos skip both by default).
- **A new visual every 2–3 s**, one per VO line. Burned-in captions always (most viewers are muted).
- **`ChapterTag`s** show progress through the video; build from simple to deep.
- **Loop it:** end on the opening shot and write the last line to flow into the first.
- Aim for about 60 s. Retention and rewatches matter more than length.

## Motion

- Things **rise** in (`fadeUp`) or **settle** in with a gentle overshoot (`popIn`, ease `pop`) and **ease out** (`fadeOut`, ease `exit`). Nothing snaps or bounces.
- Land visuals on words with `waitForVOWord('event', 'word')`.
- Durations come from `duration.*` (fast 0.35 s, base 0.7 s, slow 1.4 s). Stagger groups by `STAGGER` (0.09 s).
- Something should always be subtly alive: `float`, `spin`, twinkling stars.
- Camera-like moves = scale/position the whole group with `ease.move`.
- Every video starts with the shared `titleCard` and ends with `endCard` (via `defineVideo`).
