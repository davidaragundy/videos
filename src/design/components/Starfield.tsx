import {Circle, Node, NodeProps} from '@motion-canvas/2d';
import {useRandom} from '@motion-canvas/core';
import {palette} from '../theme';
import {useFrame} from '../utils/frame';

export interface StarfieldProps extends NodeProps {
  count?: number;
  /** Same seed → same sky. Change it per shot for variety. */
  seed?: number;
  color?: string;
  maxSize?: number;
}

/** Deterministic field of tiny stars. Wrap in a ref to parallax or twinkle it. */
export function Starfield({
  count = 160,
  seed = 1,
  color = palette.white,
  maxSize = 6,
  ...props
}: StarfieldProps) {
  const {width, height} = useFrame();
  const random = useRandom(seed);
  return (
    <Node {...props}>
      {Array.from({length: count}, () => (
        <Circle
          x={random.nextFloat(-width / 2, width / 2)}
          y={random.nextFloat(-height / 2, height / 2)}
          size={random.nextFloat(1.5, maxSize)}
          fill={color}
          opacity={random.nextFloat(0.2, 0.9)}
        />
      ))}
    </Node>
  );
}
