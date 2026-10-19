import {Circle, Latex, Line, makeScene2D, Node} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createRefArray,
  createSignal,
  useRandom,
} from '@motion-canvas/core';
import {
  Background,
  Captions,
  ChapterTag,
  colors,
  drive,
  duration,
  ease,
  fadeOut,
  fadeUp,
  Formula,
  Grain,
  palette,
  popIn,
  Sun,
  voCaptions,
  waitForVO,
  waitForVOEnd,
  Wipe,
} from '@design';
import {Surfer} from '../components/Surfer';

const INK = colors.textDark;
type Pts = [number, number][];

// --- Part A: shoaling over a sloping seabed --------------------------------------------------
const REST = -140;
const LEFT = -560;
const RIGHT = 560;
const DEEP = 820;
const SHALLOW = 70;
const seabed = (x: number) =>
  REST + DEEP - ((x - LEFT) / (RIGHT - LEFT)) * (DEEP - SHALLOW);
const STEP = 6;
const XS = Array.from({length: (RIGHT - LEFT) / STEP + 1}, (_, i) => LEFT + i * STEP);
// Shallow-water waves: c = √(g h), so wavelength ∝ √h; Green's law: height ∝ h^(−1/4).
const L0 = 380;
const depthAt = (x: number) => seabed(x) - REST;
const THETA = XS.reduce<number[]>((acc, x, i) => {
  const wavelength = L0 * Math.sqrt(depthAt(x) / DEEP);
  acc.push((i === 0 ? 0 : acc[i - 1]) + (2 * Math.PI * STEP) / wavelength);
  return acc;
}, []);
const SEABED: Pts = XS.map(x => [x, seabed(x)]);

// --- Part B: one breaking wave, close up -----------------------------------------------------
const WATERLINE = 230;
const CREST_X = -140;
const WIDTH = 230;
const REEF = WATERLINE + 470;

const closed = (pts: Pts, bottom = 1100): Pts => [
  ...pts,
  [pts.at(-1)![0], bottom],
  [pts[0][0], bottom],
];
const lift = (pts: Pts, dy: number): Pts => pts.map(([x, y]) => [x, y + dy]);

export default makeScene2D(function* (view) {
  const shore = createRef<Node>();
  const phase = createSignal(0);
  const a0 = createSignal(26);
  const formula = createRef<Latex>();
  const green = createRef<Latex>();
  const depthMark = createRef<Node>();

  const breaker = createRef<Node>();
  const height = createSignal(200);
  const lean = createSignal(0);
  const measures = createRef<Node>();
  const ratio = createRef<Latex>();
  const tube = createRef<Circle>();
  const surfer = createRef<Node>();
  const spray = createRefArray<Circle>();
  const captions = createRef<Captions>();
  const wipe = createRef<Wipe>();

  const shoaling = (): Pts =>
    XS.map((x, i) => {
      const amplitude = a0() * (DEEP / depthAt(x)) ** 0.25;
      return [x, REST - amplitude * Math.sin(THETA[i] - phase())];
    });

  // Solitary-ish crest (sech²) whose top shears forward with `lean` — >0.7 overhangs into a lip.
  const breakerCurve = (): Pts =>
    Array.from({length: 261}, (_, i) => {
      const u = -780 + i * 6;
      const f = 1 / Math.cosh(u / WIDTH) ** 2;
      return [CREST_X + u + lean() * WIDTH * f ** 3, WATERLINE - height() * f];
    });

  const random = useRandom(7);
  const sprayTargets = Array.from({length: 16}, () => ({
    x: random.nextFloat(-40, 260),
    y: random.nextFloat(-260, -60),
    size: random.nextFloat(12, 30),
  }));

  view.add(
    <>
      <Background gradient="sunset" />
      <Sun x={290} y={-330} radius={120} stripes={3} ground="#F2C79A" />

      <Node ref={shore}>
        <Line points={() => closed(lift(shoaling(), -14))} closed fill={palette.foam} />
        <Line points={() => closed(shoaling())} closed fill={palette.sea} />
        <Line points={closed(lift(SEABED, -16))} closed fill={palette.sand} />
        <Line points={closed(SEABED)} closed fill={palette.clay} />
        <Node ref={depthMark} opacity={0}>
          <Line
            points={[
              [-330, REST + 20],
              [-330, seabed(-330) - 20],
            ]}
            stroke={palette.paper}
            lineWidth={4}
            lineDash={[12, 10]}
            startArrow
            endArrow
            arrowSize={14}
          />
          <Latex
            tex="h"
            fill={palette.paper}
            height={56}
            x={-290}
            y={(REST + seabed(-330)) / 2}
          />
        </Node>
        <Formula
          ref={formula}
          tier="lg"
          fill={INK}
          y={-520}
          tex="c = \sqrt{g\,h}"
          opacity={0}
        />
        <Formula
          ref={green}
          tier="md"
          rows={1.3}
          fill={palette.terracotta}
          y={-390}
          tex="H \propto h^{-1/4}"
          opacity={0}
        />
      </Node>

      <Node ref={breaker} opacity={0}>
        <Line
          points={() => closed(lift(breakerCurve(), -16))}
          closed
          fill={palette.foam}
        />
        <Line points={() => closed(breakerCurve())} closed fill={palette.sea} />
        <Circle
          ref={tube}
          x={190}
          y={120}
          size={[200, 180]}
          fill={palette.seaDeep}
          opacity={0}
        />
        <Node x={170} y={WATERLINE - 8} rotation={-8}>
          <Surfer ref={surfer} scale={0} />
        </Node>
        <Line
          points={closed([
            [-560, REEF + 120],
            [-200, REEF + 30],
            [150, REEF],
            [560, REEF - 40],
          ])}
          closed
          fill={palette.clay}
        />
        <Node ref={measures} opacity={0}>
          <Line
            points={() => [
              [-470, WATERLINE],
              [-470, WATERLINE - height()],
            ]}
            stroke={INK}
            lineWidth={4}
            startArrow
            endArrow
            arrowSize={14}
          />
          <Latex
            tex="H"
            fill={INK}
            height={52}
            x={-422}
            y={() => WATERLINE - height() / 2}
          />
          <Line
            points={[
              [-470, WATERLINE + 30],
              [-470, REEF + 70],
            ]}
            stroke={palette.paper}
            lineWidth={4}
            lineDash={[12, 10]}
            startArrow
            endArrow
            arrowSize={14}
          />
          <Latex
            tex="d"
            fill={palette.paper}
            height={52}
            x={-422}
            y={(WATERLINE + REEF) / 2 + 40}
          />
        </Node>
        <Formula
          ref={ratio}
          tier="lg"
          fill={INK}
          y={-500}
          tex="H \approx 0.8\,d"
          opacity={0}
        />
        {sprayTargets.map(() => (
          <Circle ref={spray} size={0} fill={palette.foam} />
        ))}
      </Node>

      <ChapterTag index={4} title="Shore" tone="dark" y={-560} />
      <Grain />
      <Captions ref={captions} />
      <Wipe ref={wipe} />
    </>,
  );

  wipe().covered();
  yield wipe().reveal();
  yield voCaptions(captions());
  yield drive(phase, 3);

  // In shallow water speed depends on depth only.
  yield* waitForVO('shallow');
  yield* fadeUp(formula());
  yield* depthMark().opacity(1, duration.base);

  // Front slows, back catches up: shorter and taller (Green's law).
  yield* waitForVO('stack');
  yield* all(fadeUp(green()), a0(42, duration.slow, ease.move));

  // Cut to one wave on the reef: it grows and leans until the crest outruns its base.
  yield* waitForVO('break');
  yield* all(fadeOut(shore(), duration.fast), breaker().opacity(1, duration.fast));
  yield* all(
    height(350, 1.8, ease.move),
    lean(0.6, 1.8, ease.move),
    measures().opacity(1, duration.base),
    fadeUp(ratio()),
  );
  yield* waitForVOEnd('break', -0.9);
  yield* lean(1.5, duration.base, ease.exit);
  const crestX = () => CREST_X + lean() * WIDTH;
  // Spray flies in the background so it never delays the next line.
  yield all(
    ...spray.map((drop, i) => {
      const t = sprayTargets[i];
      drop.position([crestX(), WATERLINE - height()]);
      return all(
        drop.size(t.size, duration.fast),
        drop.position(
          [crestX() + t.x, WATERLINE - height() + t.y + 140],
          duration.slow,
          ease.enter,
        ),
        drop.opacity(0, duration.slow, ease.exit),
      );
    }),
  );

  // A steep reef makes it plunge: the lip throws over and leaves a tube.
  yield* waitForVO('barrel');
  yield* all(
    lean(2.2, duration.slow, ease.move),
    fadeOut(measures()),
    fadeOut(ratio()),
    tube().opacity(0.9, duration.slow),
  );
  yield* popIn(surfer(), duration.base);

  yield* waitForVO('ride', -0.8);
  yield* wipe().cover();
});
