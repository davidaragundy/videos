import {Node, NodeProps} from '@motion-canvas/2d';
import {all, createRef, sequence, ThreadGenerator} from '@motion-canvas/core';
import {duration, ease, palette} from '../theme';
import {useFrame} from '../utils/frame';
import {Wave} from './Wave';

export interface WipeProps extends NodeProps {
  /** Layer colours, back to front. The last one is what the screen is covered with. */
  layers?: string[];
}

const AMPLITUDE = 46;

/**
 * Signature scene transition: layered waves roll up the screen to cover it, and roll off the
 * top to reveal the next scene. Put `<Wipe ref={wipe} />` last in a scene, then
 * `yield wipe().reveal()` at the start and `yield* wipe().cover()` at the end.
 */
export class Wipe extends Node {
  private readonly waves: ReturnType<typeof createRef<Wave>>[];
  private readonly edge: number;

  public constructor({
    layers = [palette.seaLight, palette.cream],
    ...props
  }: WipeProps = {}) {
    super(props);
    const {width, height} = useFrame();
    this.edge = height / 2 + AMPLITUDE * 2;
    this.waves = layers.map(() => createRef<Wave>());
    this.add(
      layers.map((color, i) => (
        <Wave
          ref={this.waves[i]}
          y={this.edge}
          span={width + 200}
          depth={height + 400}
          amplitude={AMPLITUDE}
          wavelength={420 + i * 90}
          phase={i * 1.7}
          sharpness={1.4}
          water={color}
        />
      )),
    );
  }

  /** Start fully covered (call before `reveal` when a scene opens on the wipe). */
  public covered() {
    for (const wave of this.waves) {
      wave().rotation(180);
      wave().y(this.edge);
    }
    return this;
  }

  /** Waves roll up from the bottom until the screen is covered. */
  public *cover(time: number = duration.scene): ThreadGenerator {
    for (const wave of this.waves) {
      wave().rotation(0);
      wave().y(this.edge);
    }
    yield* sequence(
      time * 0.15,
      ...this.waves.map(wave =>
        all(
          wave().y(-this.edge, time, ease.move),
          wave().phase(wave().phase() + 2.4, time),
        ),
      ),
    );
  }

  /** Covered screen rolls away off the top, front layer first. */
  public *reveal(time: number = duration.scene): ThreadGenerator {
    this.covered();
    yield* sequence(
      time * 0.15,
      ...[...this.waves]
        .reverse()
        .map(wave =>
          all(
            wave().y(-this.edge, time, ease.move),
            wave().phase(wave().phase() - 2.4, time),
          ),
        ),
    );
  }
}
