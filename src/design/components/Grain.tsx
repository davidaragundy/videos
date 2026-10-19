import {Gradient, Img, Node, NodeProps, Rect} from '@motion-canvas/2d';
import {palette} from '../theme';
import {useFrame} from '../utils/frame';

const textures = new Map<string, string>();

/** Monochrome noise as a PNG data URL, generated once per size (deterministic). */
function noise(width: number, height: number) {
  const key = `${width}x${height}`;
  const cached = textures.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(width, height);
  let seed = 1337;
  for (let i = 0; i < image.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed >>> 24;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const url = canvas.toDataURL('image/png');
  textures.set(key, url);
  return url;
}

export interface GrainProps extends NodeProps {
  /** Strength of the film grain, 0–1. */
  amount?: number;
  /** Darkening towards the corners, 0–1. */
  vignette?: number;
}

/**
 * The "printed" finish: film grain plus a soft vignette. Add it as the last visual layer of
 * every scene (under captions) — it's most of what separates flat vectors from cheap ones.
 */
export function Grain({amount = 0.14, vignette = 0.28, ...props}: GrainProps) {
  const {width, height} = useFrame();
  return (
    <Node {...props}>
      <Img
        src={noise(Math.round(width / 2), Math.round(height / 2))}
        width={width}
        height={height}
        smoothing={false}
        compositeOperation="overlay"
        opacity={amount}
      />
      <Rect
        width={width}
        height={height}
        opacity={vignette}
        fill={
          new Gradient({
            type: 'radial',
            fromRadius: Math.min(width, height) * 0.35,
            toRadius: Math.hypot(width, height) * 0.6,
            stops: [
              {offset: 0, color: `${palette.ink}00`},
              {offset: 1, color: palette.ink},
            ],
          })
        }
      />
    </Node>
  );
}
