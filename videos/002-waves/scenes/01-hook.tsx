import {Circle, makeScene2D, Node, Txt} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createRefArray,
  createSignal,
  loop,
  sequence,
} from '@motion-canvas/core';
import {
  Captions,
  ChapterTag,
  duration,
  ease,
  fadeUp,
  fonts,
  Grain,
  palette,
  popIn,
  text,
  useFrame,
  voCaptions,
  waitForVO,
  Wipe,
} from '@design';
import {createOpening} from '../components/Opening';

const DROP_X = -300;
const HEADLINE = ['This wave', 'crossed', 'an ocean.'];
const TWIST = ['The water?', 'Barely', 'moved.'];

export default makeScene2D(function* (view) {
  const frame = useFrame();
  const opening = createOpening();
  const lines = createRefArray<Txt>();
  const drop = createRef<Node>();
  const ring = createRef<Circle>();
  const captions = createRef<Captions>();
  const wipe = createRef<Wipe>();
  const orbit = createSignal(0);

  const lineY = (i: number) => frame.safe.top + 70 + i * 116;

  view.add(
    <>
      {opening.node}
      {HEADLINE.map((line, i) => (
        <Txt
          ref={lines}
          {...(i === 2 ? text.accent : text.h1)}
          fontSize={i === 2 ? 150 : text.h1.fontSize}
          fill={i === 2 ? palette.coral : palette.terracotta}
          offset={[-1, 0]}
          x={frame.safe.left + 64}
          y={lineY(i)}
          text={line}
          opacity={0}
        />
      ))}
      <ChapterTag index={0} title="How waves work" tone="dark" y={-300} />
      <Node
        ref={drop}
        x={() => DROP_X + 26 * Math.cos(orbit())}
        y={() => opening.sea().heightAt(DROP_X) + 170 - 26 * Math.sin(orbit())}
        scale={0}
      >
        <Circle ref={ring} size={120} stroke={palette.paper} lineWidth={4} />
        <Circle size={30} fill={palette.paper} />
        <Txt
          fontFamily={fonts.serif}
          fontStyle="italic"
          fontSize={52}
          fill={palette.paper}
          y={110}
          text="this water"
        />
      </Node>
      <Grain />
      <Captions ref={captions} />
      <Wipe ref={wipe} />
    </>,
  );

  yield opening.idle();
  yield voCaptions(captions());

  // The shot is alive from frame 0; the headline rises in on the first words.
  yield* waitForVO('hook');
  yield* sequence(0.12, ...lines.map(l => fadeUp(l, duration.base, 50)));

  // The twist opens the loop the rest of the video pays off.
  yield* waitForVO('twist');
  yield* all(...lines.map(l => l.opacity(0, duration.fast, ease.exit)));
  lines.forEach((l, i) => l.text(TWIST[i]));
  yield all(
    sequence(0.1, ...lines.map(l => fadeUp(l, duration.base, 40))),
    popIn(drop(), duration.base),
  );
  yield loop(Infinity, () => orbit(orbit() + Math.PI * 2, 1.6, t => t));
  yield loop(Infinity, () => ring().scale(1.18, 0.8, ease.move).to(1, 0.8, ease.move));

  yield* waitForVO('storm', -0.8);
  yield* wipe().cover();
});
