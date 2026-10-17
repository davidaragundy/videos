import {Rect, RectProps, Txt} from '@motion-canvas/2d';
import {createRef, Reference} from '@motion-canvas/core';
import {colors, radius, safe, space, text} from '../theme';

export interface CaptionProps extends RectProps {
  /** Receives the inner Txt so scenes can call `caption().text('…', 0.4)`. */
  textRef?: Reference<Txt>;
}

/** Subtitle box anchored to the bottom safe area. Starts empty. */
export function Caption({textRef = createRef<Txt>(), ...props}: CaptionProps) {
  return (
    <Rect
      layout
      y={safe.bottom - space(6)}
      padding={[space(1.5), space(3)]}
      radius={radius.md}
      fill={colors.shadow}
      {...props}
    >
      <Txt ref={textRef} {...text.caption} text="" />
    </Rect>
  );
}
