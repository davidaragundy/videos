import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {colors, fontSize, radius, space, text} from '../theme';
import {useFrame} from '../utils/frame';

export interface LabelProps extends RectProps {
  text: string;
  color?: string;
  textColor?: string;
}

/** Pill-shaped annotation in tracked caps, e.g. pointing at part of a diagram. */
export function Label({
  text: content,
  color = colors.backgroundLight,
  textColor = colors.textDark,
  ...props
}: LabelProps) {
  const {vertical} = useFrame();
  return (
    <Rect
      layout
      padding={vertical ? [space(2), space(4)] : [space(1.5), space(3)]}
      radius={radius.pill}
      fill={color}
      {...props}
    >
      <Txt
        {...text.label}
        fontSize={vertical ? fontSize.labelVertical : fontSize.label}
        fill={textColor}
        text={content.toUpperCase()}
      />
    </Rect>
  );
}
