import {Line, makeScene2D, Node, Spline, Txt} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createRefArray,
  createSignal,
  delay,
  loop,
  waitFor,
} from '@motion-canvas/core';
import {
  Background,
  Captions,
  ChapterTag,
  Cloud,
  drive,
  duration,
  ease,
  fadeUp,
  Grain,
  palette,
  Sea,
  text,
  useFrame,
  voCaptions,
  waitForVO,
  waitForVOWord,
  Wipe,
} from '@design';

const FACTORS = [
  ['i.', 'Wind speed', 'wind'],
  ['ii.', 'Time', 'time'],
  ['iii.', 'Distance', 'distance'],
] as const;

export default makeScene2D(function* (view) {
  const frame = useFrame();
  const clouds = createRefArray<Node>();
  const rain = createRef<Node>();
  const gusts = createRefArray<Spline>();
  const sea = createRef<Sea>();
  const rows = createRefArray<Node>();
  const captions = createRef<Captions>();
  const wipe = createRef<Wipe>();
  const fall = createSignal(0);

  const CLOUDS = [
    {x: -230, y: -560, size: 460, color: palette.cream, from: -900},
    {x: 180, y: -500, size: 560, color: palette.paper, from: 900},
    {x: -20, y: -400, size: 360, color: palette.blush, from: -900},
  ];

  view.add(
    <>
      <Background gradient="terracotta" />
      <Node ref={rain} opacity={0}>
        {Array.from({length: 16}, (_, i) => {
          const y = () => ((fall() * 900 + i * 131) % 760) - 400;
          return (
            <Line
              x={() => -440 + ((i * 167) % 900) + y() * 0.22}
              y={y}
              points={[
                [0, 0],
                [-10, 44],
              ]}
              stroke={palette.cream}
              lineWidth={6}
              lineCap="round"
              opacity={0.4}
            />
          );
        })}
      </Node>
      {CLOUDS.map(c => (
        <Cloud ref={clouds} x={c.from} y={c.y} size={c.size} color={c.color} />
      ))}
      {[-170, -40, 90, 210].map((y, i) => (
        <Spline
          ref={gusts}
          y={y}
          points={[
            [-620, 0],
            [-300, -36 - i * 6],
            [0, 14],
            [300, -30],
            [620, 4],
          ]}
          smoothness={0.6}
          stroke={palette.paper}
          lineWidth={7}
          lineCap="round"
          opacity={0}
          end={0.001}
        />
      ))}
      {FACTORS.map(([n, label], i) => (
        <Node ref={rows} x={frame.safe.left + 64} y={-170 + i * 120} opacity={0}>
          <Txt {...text.accent} fill={palette.apricot} offset={[-1, 0]} text={n} />
          <Txt {...text.h2} x={130} offset={[-1, 0]} text={label} />
        </Node>
      ))}
      <Sea
        ref={sea}
        y={380}
        amplitude={0}
        wavelength={110}
        sharpness={1}
        foam={palette.cream}
      />
      <ChapterTag index={1} title="Birth" />
      <Grain />
      <Captions ref={captions} />
      <Wipe ref={wipe} />
    </>,
  );

  wipe().covered();
  yield wipe().reveal();
  yield voCaptions(captions());
  yield drive(fall, 1);

  // A storm, far away: clouds roll in, rain starts.
  yield* waitForVO('storm');
  yield* all(
    ...clouds.map((c, i) => c.x(CLOUDS[i].x, duration.slow + i * 0.2, ease.enter)),
    rain().opacity(1, duration.slow),
  );
  yield all(
    ...clouds.map((c, i) =>
      loop(Infinity, () => c.x(CLOUDS[i].x + 30, 3).to(CLOUDS[i].x, 3)),
    ),
  );

  // Wind drags on the surface — gusts sweep across, the sea starts to shiver.
  yield* waitForVO('ripples');
  gusts.forEach(g => g.opacity(0.55).start(0).end(0.001));
  yield all(
    ...gusts.map((g, i) =>
      delay(
        i * 0.3,
        loop(Infinity, function* () {
          g.start(0).end(0.001);
          yield* all(
            g.end(1, 1.3, ease.move),
            delay(0.45, g.start(0.999, 1.3, ease.move)),
          );
          yield* waitFor(0.3);
        }),
      ),
    ),
  );
  yield drive(sea().phase, 5);
  yield* sea().amplitude(14, duration.slow, ease.enter);

  // Speed, time, distance: the swell builds (and longer waves move faster, for free).
  yield* waitForVO('grow');
  yield all(
    sea().amplitude(90, 3.6, ease.move),
    sea().wavelength(420, 3.6, ease.move),
    sea().sharpness(1.8, 3.6, ease.move),
  );
  for (const [i, [, , word]] of FACTORS.entries()) {
    yield* waitForVOWord('grow', word, -0.1);
    yield fadeUp(rows[i], duration.base, 30);
  }

  yield* waitForVO('energy', -0.8);
  yield* wipe().cover();
});
