import {useScene} from '@motion-canvas/core';
import {Format, formats} from '../theme';

export interface Frame {
  format: Format;
  vertical: boolean;
  width: number;
  height: number;
  /** Safe-area edges in scene coordinates (origin at the centre). */
  safe: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
  /** Centre of the safe area — vertical frames are not symmetric. */
  center: {x: number; y: number};
}

/**
 * The current scene's frame: size, orientation and safe area. Call it while building the
 * scene (inside `makeScene2D` or a component) to lay things out for either format.
 */
export function useFrame(): Frame {
  const size = useScene().getSize();
  const format: Format = size.y > size.x ? 'vertical' : 'landscape';
  const inset = formats[format].safe;
  const [w, h] = [size.x, size.y];
  const safe = {
    top: -h / 2 + inset.top,
    bottom: h / 2 - inset.bottom,
    left: -w / 2 + inset.left,
    right: w / 2 - inset.right,
    width: w - inset.left - inset.right,
    height: h - inset.top - inset.bottom,
  };
  return {
    format,
    vertical: format === 'vertical',
    width: w,
    height: h,
    safe,
    center: {x: (safe.left + safe.right) / 2, y: (safe.top + safe.bottom) / 2},
  };
}
