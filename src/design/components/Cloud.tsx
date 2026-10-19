import {Circle, Node, NodeProps, Rect} from '@motion-canvas/2d';
import {palette} from '../theme';

export interface CloudProps extends NodeProps {
  color?: string;
  /** Width of the cloud in px. */
  size?: number;
}

/** Flat puffy cloud built from circles. Darken the colour for storms. */
export function Cloud({color = palette.cloud, size = 420, ...props}: CloudProps) {
  const u = size / 10;
  return (
    <Node {...props}>
      <Rect
        width={size * 0.9}
        height={u * 2.6}
        y={u * 1.2}
        radius={u * 1.3}
        fill={color}
      />
      <Circle size={u * 4} x={-u * 2.6} y={u * 0.6} fill={color} />
      <Circle size={u * 5.4} x={-u * 0.4} y={-u * 0.6} fill={color} />
      <Circle size={u * 4.2} x={u * 2.4} y={u * 0.2} fill={color} />
    </Node>
  );
}
