import {Layout, makeScene2D, Txt} from '@motion-canvas/2d';
import {createRef, waitUntil} from '@motion-canvas/core';
import {
  Background,
  Captions,
  Grain,
  fadeUp,
  popIn,
  Planet,
  Starfield,
  text,
  voCaptions,
  waitForVO,
} from '@design';

export default makeScene2D(function* (view) {
  const planet = createRef<Planet>();
  const heading = createRef<Layout>();
  const captions = createRef<Captions>();

  view.add(
    <>
      <Background />
      <Starfield />
      <Planet ref={planet} scale={0} />
      <Layout ref={heading} y={-360}>
        <Txt {...text.h2} text="Start here" />
      </Layout>
      <Grain />
      <Captions ref={captions} />
    </>,
  );

  // Subtitles follow the VO line by line once `pnpm voice` has run.
  yield voCaptions(captions());

  // Waits for the "intro" VO line (or an editor marker until `pnpm voice` has run).
  yield* waitForVO('intro');
  yield* popIn(planet());
  yield* fadeUp(heading());
  yield* waitUntil('end');
});
