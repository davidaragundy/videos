import {Circle, Line, makeScene2D, Node, Txt} from '@motion-canvas/2d';
import {all, createRef, createRefArray, loop} from '@motion-canvas/core';
import {
  Background,
  Captions,
  ChapterTag,
  drive,
  duration,
  fonts,
  Grain,
  palette,
  popIn,
  Sea,
  stagger,
  voCaptions,
  waitForVO,
  Wipe,
} from '@design';

const SURFACE = -250;
const COLUMNS = [-300, 0, 300];
const DEPTHS = [0, 80, 170, 290];

export default makeScene2D(function* (view) {
  const sea = createRef<Sea>();
  const energy = createRef<Node>();
  const rows = createRefArray<Node>();
  const captions = createRef<Captions>();
  const wipe = createRef<Wipe>();

  // Linear (Airy) wave theory: each parcel orbits a circle of radius A·e^(−k·depth).
  const k = () => (2 * Math.PI) / sea().wavelength();
  const theta = (x: number) => k() * x - sea().phase();
  const radius = (d: number) => sea().amplitude() * Math.exp(-k() * d);

  view.add(
    <>
      <Background gradient="beach" />
      <Sea
        ref={sea}
        y={SURFACE}
        amplitude={70}
        wavelength={560}
        sharpness={1}
        layers={[palette.sea]}
        foam={palette.seaLight}
        depth={1600}
      />
      {DEPTHS.map(d => (
        <Node ref={rows} scale={0}>
          {COLUMNS.map(x => (
            <>
              <Circle
                x={x}
                y={SURFACE + d}
                size={() => radius(d) * 2}
                stroke={palette.apricot}
                lineWidth={3}
                opacity={0.8}
              />
              <Circle
                x={() => x + radius(d) * Math.cos(theta(x))}
                y={() => SURFACE + d - radius(d) * Math.sin(theta(x))}
                size={d === 0 ? 30 : 24}
                fill={x === 0 ? palette.sun : palette.paper}
              />
            </>
          ))}
        </Node>
      ))}
      <Node ref={energy} y={SURFACE - 230} opacity={0}>
        <Txt
          fontFamily={fonts.serif}
          fontStyle="italic"
          fontSize={76}
          fill={palette.terracotta}
          x={-40}
          text="energy"
        />
        <Line
          points={[
            [110, 6],
            [200, 6],
          ]}
          stroke={palette.terracotta}
          lineWidth={6}
          endArrow
          arrowSize={18}
          lineCap="round"
        />
      </Node>
      <ChapterTag index={2} title="Energy" tone="dark" y={-560} />
      <Grain />
      <Captions ref={captions} />
      <Wipe ref={wipe} />
    </>,
  );

  wipe().covered();
  yield wipe().reveal();
  yield voCaptions(captions());
  yield drive(sea().phase, 2.6);

  // The wave carries energy to the right…
  yield* waitForVO('energy');
  yield loop(Infinity, function* () {
    energy().x(-320);
    yield* all(
      energy().opacity(1, duration.fast),
      energy().x(300, 2.4, t => t),
    );
    yield* energy().opacity(0, duration.fast);
  });

  // …while the water itself just goes round in circles, smaller and smaller with depth.
  yield* waitForVO('orbit');
  yield* stagger(rows, r => popIn(r, duration.base), 0.25);

  yield* waitForVO('sine', -0.8);
  yield* wipe().cover();
});
