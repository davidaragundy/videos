import {Circle, Line, Node, NodeProps, Rect} from '@motion-canvas/2d';
import {palette} from '@design';

/** Flat, rounded surfer silhouette on a striped board. Origin = middle of the board's bottom. */
export function Surfer(props: NodeProps) {
  const suit = palette.ink;
  const limb = {stroke: suit, lineCap: 'round', lineJoin: 'round'} as const;
  return (
    <Node {...props}>
      <Rect y={-15} width={220} height={30} radius={15} fill={palette.paper} />
      <Rect y={-15} width={220} height={8} fill={palette.coral} />
      <Line
        {...limb}
        lineWidth={22}
        points={[
          [-46, -28],
          [-30, -72],
          [-4, -102],
        ]}
      />
      <Line
        {...limb}
        lineWidth={22}
        points={[
          [42, -28],
          [36, -68],
          [-4, -102],
        ]}
      />
      <Line
        {...limb}
        lineWidth={34}
        points={[
          [-4, -104],
          [18, -152],
        ]}
      />
      <Line
        {...limb}
        lineWidth={14}
        points={[
          [-72, -120],
          [14, -142],
          [94, -124],
        ]}
      />
      <Circle x={27} y={-190} size={46} fill={palette.apricot} />
    </Node>
  );
}
