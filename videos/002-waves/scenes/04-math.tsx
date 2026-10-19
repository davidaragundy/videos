import {Circle, Latex, Layout, Line, makeScene2D, Node, Txt} from '@motion-canvas/2d';
import {all, createRef, linear} from '@motion-canvas/core';
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
  formulaHeight,
  Grain,
  Label,
  palette,
  popIn,
  text,
  voCaptions,
  waitForVO,
  waitForVOWord,
  Wave,
  Wipe,
} from '@design';

const RACE = 3.4; // seconds the long and short waves race for
const LONG = {y: -170, wavelength: 520, speed: 250};
const SHORT = {y: 140, wavelength: 130, speed: 125}; // c ∝ √λ: ¼ the length → ½ the speed
const INK = colors.textDark;

export default makeScene2D(function* (view) {
  const formula = createRef<Latex>();
  const sine = createRef<Wave>();
  const sineParts = createRef<Node>();
  const ampArrow = createRef<Node>();
  const lambdaArrow = createRef<Node>();
  const defs = createRef<Latex>();
  const race = createRef<Node>();
  const long = createRef<Wave>();
  const short = createRef<Wave>();
  const longRider = createRef<Node>();
  const shortRider = createRef<Node>();
  const sea = createRef<Wave>();
  const chopLabel = createRef<Layout>();
  const swellLabel = createRef<Layout>();
  const captions = createRef<Captions>();
  const wipe = createRef<Wipe>();

  // A crest one wavelength left of the first (sin θ = 1 → x = λ/4 + nλ).
  const crest = (wavelength: number) => wavelength / 4 - wavelength;

  view.add(
    <>
      <Background gradient="cream" />
      <Formula
        ref={formula}
        tier="lg"
        fill={INK}
        y={-500}
        tex="y = A\sin(kx - \omega t)"
        opacity={0}
      />

      <Node ref={sineParts}>
        <Line
          points={[
            [-470, -150],
            [470, -150],
          ]}
          stroke={palette.blush}
          lineWidth={3}
          lineDash={[14, 14]}
        />
        <Wave
          ref={sine}
          y={-150}
          span={940}
          amplitude={0}
          wavelength={600}
          depth={0}
          surface={palette.terracotta}
          surfaceWidth={10}
        />
        <Node ref={ampArrow} opacity={0}>
          <Line
            points={[
              [150, -150],
              [150, -262],
            ]}
            stroke={palette.coral}
            lineWidth={5}
            startArrow
            endArrow
            arrowSize={16}
          />
          <Latex tex="A" fill={palette.coral} height={52} x={195} y={-206} />
        </Node>
        <Node ref={lambdaArrow} opacity={0}>
          <Line
            points={[
              [-450, -330],
              [150, -330],
            ]}
            stroke={palette.sea}
            lineWidth={5}
            startArrow
            endArrow
            arrowSize={16}
          />
          <Latex tex="\lambda" fill={palette.sea} height={56} x={-150} y={-382} />
        </Node>
        <Formula
          ref={defs}
          tier="md"
          rows={2.2}
          fill={INK}
          y={150}
          tex="k = \frac{2\pi}{\lambda} \qquad \omega = \frac{2\pi}{T}"
          opacity={0}
        />
      </Node>

      <Node ref={race} opacity={0}>
        {[
          {wave: long, rider: longRider, lane: LONG, amp: 60, color: palette.sea, w: 10},
          {
            wave: short,
            rider: shortRider,
            lane: SHORT,
            amp: 22,
            color: palette.coral,
            w: 8,
          },
        ].flatMap(({wave, rider, lane, amp, color, w}) => [
          <Wave
            ref={wave}
            y={lane.y}
            span={960}
            amplitude={amp}
            wavelength={lane.wavelength}
            depth={0}
            surface={color}
            surfaceWidth={w}
          />,
          <Node
            ref={rider}
            x={crest(lane.wavelength)}
            y={() => lane.y + wave().heightAt(rider().x()) - 30}
          >
            <Circle size={32} fill={INK} />
          </Node>,
        ])}
        <Txt {...text.h3} fill={palette.sea} x={-300} y={LONG.y - 150} text="long λ" />
        <Txt
          {...text.h3}
          fill={palette.coral}
          x={-300}
          y={SHORT.y - 110}
          text="short λ"
        />
      </Node>

      <Wave
        ref={sea}
        y={-60}
        span={960}
        amplitude={65}
        wavelength={380}
        sharpness={1.6}
        chop={1}
        depth={0}
        surface={palette.sea}
        surfaceWidth={10}
        opacity={0}
      />
      <Layout ref={chopLabel} y={-330} scale={0}>
        <Label text="Chop" color={palette.coral} textColor={palette.paper} />
      </Layout>
      <Layout ref={swellLabel} y={-330} scale={0}>
        <Label text="Clean swell" color={palette.sea} textColor={palette.paper} />
      </Layout>

      <ChapterTag index={3} title="Math" tone="dark" />
      <Grain amount={0.16} vignette={0.18} />
      <Captions ref={captions} tone="dark" />
      <Wipe ref={wipe} />
    </>,
  );

  wipe().covered();
  yield wipe().reveal();
  yield voCaptions(captions());

  // y = A sin(kx − ωt): a height, a length, a rhythm.
  yield* waitForVO('sine');
  yield* all(fadeUp(formula()), sine().amplitude(120, duration.slow, ease.move));
  yield* waitForVOWord('sine', 'height', -0.1);
  yield* ampArrow().opacity(1, duration.fast);
  yield* waitForVOWord('sine', 'length', -0.1);
  yield* lambdaArrow().opacity(1, duration.fast);
  yield* waitForVOWord('sine', 'rhythm', -0.1);
  yield fadeUp(defs());
  yield drive(sine().phase, 2.2);

  // Deep-water dispersion: longer waves travel faster.
  yield* waitForVO('speed');
  yield* all(
    fadeOut(sineParts()),
    formula().tex(
      'c = \\sqrt{\\frac{g\\lambda}{2\\pi}} \\approx 1.25\\sqrt{\\lambda}',
      duration.base,
    ),
    formula().height(formulaHeight('lg', 2), duration.base, ease.move),
    race().opacity(1, duration.base),
  );
  const k = (wavelength: number) => (2 * Math.PI) / wavelength;
  yield* all(
    long().phase(LONG.speed * k(LONG.wavelength) * RACE, RACE, linear),
    longRider().x(crest(LONG.wavelength) + LONG.speed * RACE, RACE, linear),
    short().phase(SHORT.speed * k(SHORT.wavelength) * RACE, RACE, linear),
    shortRider().x(crest(SHORT.wavelength) + SHORT.speed * RACE, RACE, linear),
  );

  // Dispersion sorts a messy sea into clean, regular swell.
  yield* waitForVO('sort');
  yield drive(sea().phase, 3);
  yield* all(
    fadeOut(race()),
    formula().opacity(0, duration.fast),
    sea().opacity(1, duration.base),
    popIn(chopLabel(), duration.base),
  );
  yield all(sea().chop(0, 2.8, ease.move), sea().amplitude(80, 2.8, ease.move));
  yield* waitForVOWord('sort', 'clean', -0.2);
  yield* all(fadeOut(chopLabel()), popIn(swellLabel(), duration.base));

  yield* waitForVO('shallow', -0.8);
  yield* wipe().cover();
});
