import {Gradient, Rect, RectProps} from '@motion-canvas/2d';
import {canvas, gradients, GradientName} from '../theme';

export interface BackgroundProps extends RectProps {
  /** A named preset from `theme/colors.ts` or a custom [top, bottom] pair. */
  gradient?: GradientName | readonly [string, string];
}

/** Full-frame vertical gradient. Put it first in every scene. */
export function Background({gradient = 'space', ...props}: BackgroundProps) {
  const [top, bottom] = typeof gradient === 'string' ? gradients[gradient] : gradient;
  return (
    <Rect
      width={canvas.width}
      height={canvas.height}
      fill={
        new Gradient({
          type: 'linear',
          from: [0, -canvas.height / 2],
          to: [0, canvas.height / 2],
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
