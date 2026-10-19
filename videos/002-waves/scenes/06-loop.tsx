import {makeScene2D} from '@motion-canvas/2d';
import {createRef} from '@motion-canvas/core';
import {Captions, ChapterTag, Grain, voCaptions, waitForVOEnd, Wipe} from '@design';
import {createOpening} from '../components/Opening';

/** Back to the opening shot, so the last frame flows straight into the first. */
export default makeScene2D(function* (view) {
  const opening = createOpening();
  const captions = createRef<Captions>();
  const wipe = createRef<Wipe>();
  view.add(
    <>
      {opening.node}
      <ChapterTag index={0} title="How waves work" tone="dark" y={-300} />
      <Grain />
      <Captions ref={captions} />
      <Wipe ref={wipe} />
    </>,
  );

  wipe().covered();
  yield wipe().reveal();
  yield opening.idle();
  yield voCaptions(captions());
  yield* waitForVOEnd('ride', 0.3);
});
