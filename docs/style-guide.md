# Style guide

The one design line every video follows. Tokens live in `src/design/theme/` — change them there, never inline.

## Colour

- Backgrounds are deep, desaturated night blues (`gradients.space`, `colors.background`). Other moods: `dusk`, `ocean`, `forest`, `ember`.
- Accents are saturated and warm-leaning: `sun`, `amber`, `coral`, `pink`, `violet`, `sky`, `cyan`, `mint`, `lime`.
- Max ~3 accent hues per frame. One "hero" colour per shot carries the subject.
- Use semantic roles (`colors.primary`, `colors.positive`, `colors.textMuted`) in scenes; raw `palette.*` only for illustration.

## Shapes

- Flat fills, no outlines, no photo textures. Depth comes from a darker shadow crescent + a soft highlight (see `Planet`).
- Rounded everything: `radius.*`, `lineCap="round"`.
- Glow (`Planet glow`, `shadowBlur`) only for things that emit light.

## Type

- Display: **Outfit** (headlines, labels). Body: **Nunito** (captions, body copy).
- Use presets: `<Txt {...text.h1} />`. Sizes are on a fixed scale tuned for 1080p.
- Labels are UPPERCASE pills (`<Label>`). Keep on-screen text short — the VO carries the words.

## Layout

- Canvas is 1920×1080, origin at the centre. Spacing is in 8px units: `space(n)`.
- Keep text inside `safe.*`. Captions sit at the bottom safe line.

## Motion

- Things **pop** in (`popIn`, ease `pop`) and **ease out** of frame (`fadeOut`, ease `exit`).
- Durations come from `duration.*` (fast 0.3 s, base 0.6 s, slow 1.2 s). Stagger groups by `STAGGER` (0.08 s).
- Something should always be subtly alive: `float`, `spin`, twinkling stars.
- Camera-like moves = scale/position the whole group with `ease.move`.
- Every video starts with the shared `titleCard` and ends with `endCard` (via `defineVideo`).
