import {Layout, makeScene2D, Txt} from '@motion-canvas/2d';
import {createRef, waitUntil} from '@motion-canvas/core';
import {Background, Caption, fadeUp, popIn, Planet, Starfield, text} from '@design';

export default makeScene2D(function* (view) {
  const planet = createRef<Planet>();
  const heading = createRef<Layout>();
  const caption = createRef<Txt>();

  view.add(
    <>
      <Background />
      <Starfield />
      <Planet ref={planet} scale={0} />
      <Layout ref={heading} y={-360}>
        <Txt {...text.h2} text="Start here" />
      </Layout>
      <Caption textRef={caption} />
    </>,
  );

  // Drag the "intro" event in the editor timeline to sync with voiceover.
  yield* waitUntil('intro');
  yield* popIn(planet());
  yield* fadeUp(heading());
  yield* caption().text('Replace me with the first line of the script.', 0.6);
  yield* waitUntil('end');
});
