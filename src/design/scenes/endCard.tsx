import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createRef, fadeTransition, waitFor} from '@motion-canvas/core';
import {fadeUp} from '../animations';
import {Background, Starfield} from '../components';
import {colors, duration, space, text} from '../theme';

/** Shared closing card. */
export default makeScene2D(function* (view) {
  const thanks = createRef<Txt>();
  const cta = createRef<Txt>();

  view.add(
    <>
      <Background gradient="dusk" />
      <Starfield seed={7} opacity={0.6} />
      <Txt ref={thanks} {...text.h1} text="Thanks for watching" y={-space(4)} />
      <Txt
        ref={cta}
        {...text.h3}
        fill={colors.primary}
        text="Stay curious."
        y={space(8)}
      />
    </>,
  );

  yield* fadeTransition(duration.scene);
  yield* all(fadeUp(thanks()), fadeUp(cta(), duration.slow));
  yield* waitFor(3);
});
