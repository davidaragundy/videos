import {initial, Node, NodeProps, signal} from '@motion-canvas/2d';
import {createRef, SignalValue, SimpleSignal} from '@motion-canvas/core';
import {palette} from '../theme';
import {Wave} from './Wave';

export interface SeaProps extends NodeProps {
  amplitude?: SignalValue<number>;
  wavelength?: SignalValue<number>;
  phase?: SignalValue<number>;
  drift?: SignalValue<number>;
  sharpness?: SignalValue<number>;
  chop?: SignalValue<number>;
  span?: SignalValue<number>;
  depth?: SignalValue<number>;
  /** Layer colours, back to front. */
  layers?: string[];
  /** Cream lip along the front wave's crest. */
  foam?: string | null;
}

/**
 * Layered "paper cut" sea: a few flat wave bands stacked back to front, each a little
 * different in size and speed, with a foam lip on the front one. Drive `phase` to animate.
 * `front` is the wave to place riders on (`front().heightAt(x)`).
 */
export class Sea extends Node {
  @initial(70) @signal() declare public readonly amplitude: SimpleSignal<number, this>;
  @initial(640) @signal() declare public readonly wavelength: SimpleSignal<number, this>;
  @initial(0) @signal() declare public readonly phase: SimpleSignal<number, this>;
  /** Extra phase for the back layers only — drive it to keep the far sea moving while the
   * front wave holds still (a camera travelling with the wave). */
  @initial(0) @signal() declare public readonly drift: SimpleSignal<number, this>;
  @initial(1.5) @signal() declare public readonly sharpness: SimpleSignal<number, this>;
  @initial(0) @signal() declare public readonly chop: SimpleSignal<number, this>;
  @initial(1400) @signal() declare public readonly span: SimpleSignal<number, this>;
  @initial(1400) @signal() declare public readonly depth: SimpleSignal<number, this>;

  public readonly front = createRef<Wave>();

  public constructor({
    layers = [palette.seaLight, palette.sea, palette.seaDeep],
    foam = palette.foam,
    ...props
  }: SeaProps = {}) {
    super(props);
    const n = layers.length;
    // Back layers sit higher, are smaller, shorter and slower — cheap but convincing depth.
    const depthOf = (i: number) => (n - 1 - i) / Math.max(1, n - 1);
    const layer = (i: number) => ({
      y: -depthOf(i) * 0.9 * this.amplitude() - depthOf(i) * 34,
      amplitude: this.amplitude() * (1 - depthOf(i) * 0.45),
      wavelength: this.wavelength() * (1 - depthOf(i) * 0.3),
      phase: this.phase() * (1 - depthOf(i) * 0.35) + this.drift() * depthOf(i) + i * 2.1,
    });

    this.add(
      <>
        {layers.map((color, i) => {
          const front = i === n - 1;
          const wave = (offset = 0, fill = color) => (
            <Wave
              ref={front && offset === 0 ? this.front : undefined}
              y={() => layer(i).y + offset}
              amplitude={() => layer(i).amplitude}
              wavelength={() => layer(i).wavelength}
              phase={() => layer(i).phase}
              sharpness={this.sharpness}
              chop={this.chop}
              span={this.span}
              depth={this.depth}
              water={fill}
            />
          );
          return front && foam ? (
            <>
              {wave(-14, foam)}
              {wave()}
            </>
          ) : (
            wave()
          );
        })}
      </>,
    );
  }

  /** Surface height of the front layer at local x. */
  public heightAt(x: number) {
    return this.front().y() + this.front().heightAt(x);
  }

  /** Phase offset of the front layer relative to `phase` (to place crests precisely). */
  public static frontPhaseOffset(layers = 3) {
    return (layers - 1) * 2.1;
  }

  public slopeAt(x: number) {
    return this.front().slopeAt(x);
  }
}
