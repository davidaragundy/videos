import {Layout, makeScene2D, Node} from '@motion-canvas/2d';
import {all, createRef, useScene, waitFor} from '@motion-canvas/core';
import {popIn, fadeUp, float} from '../animations';
import {Background, Planet, Starfield, Title} from '../components';
import {duration, ease, palette} from '../theme';

/** Shared opening card. Reads `title` / `subtitle` from project variables. */
export default makeScene2D(function* (view) {
  const vars = useScene().variables;
  const title = vars.get('title', 'Untitled')() as string;
  const subtitle = vars.get('subtitle', '')() as string;

  const stars = createRef<Node>();
  const planet = createRef<Planet>();
  const heading = createRef<Layout>();

  view.add(
    <>
      <Background gradient="space" />
      <Starfield ref={stars} seed={42} opacity={0} />
      <Planet
        ref={planet}
        x={620}
        y={260}
        radius={140}
        color={palette.violet}
        scale={0}
      />
      <Title ref={heading} title={title} subtitle={subtitle || undefined} />
    </>,
  );

  yield* all(
    stars().opacity(1, duration.slow, ease.enter),
    popIn(planet(), duration.slow),
    fadeUp(heading(), duration.slow),
  );
  yield float(planet());
  yield* waitFor(2);
  yield* heading().opacity(0, duration.base, ease.exit);
});
