import {Gradient, Rect, RectProps} from '@motion-canvas/2d';
import {gradients, GradientName} from '../theme';
import {useFrame} from '../utils/frame';

export interface BackgroundProps extends RectProps {
  /** A named preset from `theme/colors.ts` or a custom [top, bottom] pair. */
  gradient?: GradientName | readonly [string, string];
}

/** Full-frame vertical gradient. Put it first in every scene. */
export function Background({gradient = 'space', ...props}: BackgroundProps) {
  const {width, height} = useFrame();
  const [top, bottom] = typeof gradient === 'string' ? gradients[gradient] : gradient;
  return (
    <Rect
      width={width}
      height={height}
      fill={
        new Gradient({
          type: 'linear',
          from: [0, -height / 2],
          to: [0, height / 2],
          stops: [
            {offset: 0, color: top},
            {offset: 1, color: bottom},
          ],
        })
      }
      {...props}
    />
  );
}
