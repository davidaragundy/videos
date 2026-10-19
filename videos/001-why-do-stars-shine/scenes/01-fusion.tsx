import {Circle, Layout, Line, makeScene2D, Node} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  createRefArray,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import {
  Background,
  Captions,
  Grain,
  duration,
  ease,
  fadeOut,
  fadeUp,
  float,
  Label,
  palette,
  Planet,
  popIn,
  Starfield,
  stagger,
  voCaptions,
  waitForVO,
} from '@design';

export default makeScene2D(function* (view) {
  const stars = createRef<Node>();
  const sun = createRef<Planet>();
  const captions = createRef<Captions>();
  const protons = createRefArray<Circle>();
  const helium = createRef<Circle>();
  const flash = createRef<Circle>();
  const label = createRef<Layout>();
  const rays = createRefArray<Line>();

  view.add(
    <>
      <Background gradient="space" />
      <Starfield ref={stars} seed={3} />
      {Array.from({length: 12}, (_, i) => (
        <Line
          ref={rays}
          points={[
            [0, 0],
            [0, -1],
          ]}
          rotation={i * 30}
          stroke={palette.sun}
          lineWidth={10}
          lineCap="round"
          start={0}
          end={0}
        />
      ))}
      <Planet ref={sun} radius={220} color={palette.sun} glow={0} scale={0} />
      {[-1, 1].map(side => (
        <Circle ref={protons} x={side * 700} size={70} fill={palette.coral} opacity={0} />
      ))}
      <Circle ref={flash} size={0} fill={palette.white} opacity={0} />
      <Circle ref={helium} size={110} fill={palette.mint} scale={0} />
      <Layout ref={label} y={180} opacity={0}>
        <Label text="Helium" color={palette.mint} textColor={palette.ink} />
      </Layout>
      <Grain />
      <Captions ref={captions} />
    </>,
  );

  // Subtitles follow the voiceover line by line (text + timing from voiceover.json).
  yield voCaptions(captions());

  // — Beat 1: a star appears.
  yield* waitForVO('star');
  yield* all(popIn(sun(), duration.slow), sun().glow(0.6, duration.slow, ease.enter));
  yield float(sun(), 8, 4);
  yield* waitFor(1);

  // — Beat 2: zoom into the core; protons get squeezed towards each other.
  yield* waitForVO('core');
  yield* all(
    sun().scale(8, duration.slow, ease.move),
    sun().opacity(0.35, duration.slow, ease.move),
    stars().opacity(0, duration.base),
    stagger(protons, p => fadeUp(p, duration.fast)),
  );
  yield* all(
    ...protons.map((p, i) => p.x((i === 0 ? -1 : 1) * 150, duration.slow * 2, ease.move)),
  );

  // — Beat 3: "…until they fuse" — the collision lands on the word.
  yield* waitForVO('fuse');
  yield* all(...protons.map(p => p.x(0, duration.base, ease.exit)));
  yield* chain(
    all(
      flash().size(600, duration.fast, ease.enter),
      flash().opacity(1, duration.instant),
    ),
    all(
      flash().opacity(0, duration.base),
      ...protons.map(p => p.opacity(0, duration.instant)),
    ),
  );
  yield* all(popIn(helium()), label().opacity(1, duration.base));

  // — Beat 4: energy radiates out.
  yield* waitForVO('light');
  rays.forEach(r =>
    r.points([
      [0, 160],
      [0, 900],
    ]),
  );
  yield* stagger(rays, r => (r as Line).end(1, duration.slow, ease.enter), 0.04);
  yield* all(...rays.map(r => r.start(1, duration.slow, ease.exit)));

  // No VO line for `end` — it stays an editor marker.
  yield* waitUntil('end');
  yield* all(fadeOut(helium()), fadeOut(label()));
});
