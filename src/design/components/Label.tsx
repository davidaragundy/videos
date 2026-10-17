import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {colors, radius, space, text} from '../theme';

export interface LabelProps extends RectProps {
  text: string;
  color?: string;
  textColor?: string;
}

/** Pill-shaped annotation, e.g. pointing at part of a diagram. */
export function Label({
  text: content,
  color = colors.surface,
  textColor = colors.text,
  ...props
}: LabelProps) {
  return (
    <Rect
      layout
      padding={[space(1.5), space(3)]}
      radius={radius.pill}
      fill={color}
      {...props}
    >
      <Txt {...text.label} fill={textColor} text={content.toUpperCase()} />
    </Rect>
  );
}
