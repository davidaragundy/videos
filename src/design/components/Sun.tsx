import {Circle, Node, NodeProps, Rect} from '@motion-canvas/2d';
import {palette} from '../theme';

export interface SunProps extends NodeProps {
  radius?: number;
  color?: string;
  /** Colour of the background behind the sun — the retro stripes are cut in this colour. */
  ground?: string;
  /** Number of horizontal cut stripes across the lower half (0 = plain disc). */
  stripes?: number;
}

/** Flat retro poster sun: a disc with horizontal stripes cut out of its lower half. */
export function Sun({
  radius = 180,
  color = palette.orange,
  ground = palette.paper,
  stripes = 4,
  ...props
}: SunProps) {
  return (
    <Node {...props}>
      <Circle size={radius * 2} fill={color} clip>
        {Array.from({length: stripes}, (_, i) => {
          const t = (i + 1) / (stripes + 1);
          return (
            <Rect
              y={radius * (0.15 + t * 0.85)}
              width={radius * 2}
              height={radius * 0.05 * (1 + i * 0.6)}
              fill={ground}
            />
          );
        })}
      </Circle>
    </Node>
  );
}
