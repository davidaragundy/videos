import {initial, Line, Node, NodeProps, signal} from '@motion-canvas/2d';
import {PossibleColor, SignalValue, SimpleSignal} from '@motion-canvas/core';
import {palette} from '../theme';

export interface WaveProps extends NodeProps {
  /** Crest height above the rest line, px. */
  amplitude?: SignalValue<number>;
  wavelength?: SignalValue<number>;
  /** Phase in radians. Increase it over time to move the wave right (see `drive`). */
  phase?: SignalValue<number>;
  /** 1 = pure sine. >1 sharpens crests and flattens troughs, like real swell. */
  sharpness?: SignalValue<number>;
  /** 0–1: mixes in extra crossing waves for a messy, choppy sea. */
  chop?: SignalValue<number>;
  /** Horizontal extent, centred on the node. */
  span?: SignalValue<number>;
  /** How far the water body extends below the rest line (0 = surface only). */
  depth?: SignalValue<number>;
  water?: SignalValue<PossibleColor>;
  surface?: SignalValue<PossibleColor>;
  surfaceWidth?: SignalValue<number>;
}

const unwrapWidth = (w: SignalValue<number>) => (typeof w === 'function' ? w() : w);

// Fixed "random" components for chop: [relative amplitude, relative wavenumber, phase speed, offset].
const CHOP = [
  [0.55, 2.7, 1.6, 1.3],
  [0.35, 4.1, 2.1, 4.2],
  [0.45, 1.7, 0.7, 2.6],
  [0.25, 6.3, 2.9, 0.4],
] as const;

/**
 * A travelling ocean wave: surface line plus an optional filled water body.
 * Use `heightAt(x)` / `slopeAt(x)` to put things on the surface (surfers, drops, boats).
 */
export class Wave extends Node {
  @initial(60) @signal() declare public readonly amplitude: SimpleSignal<number, this>;
  @initial(600) @signal() declare public readonly wavelength: SimpleSignal<number, this>;
  @initial(0) @signal() declare public readonly phase: SimpleSignal<number, this>;
  @initial(1) @signal() declare public readonly sharpness: SimpleSignal<number, this>;
  @initial(0) @signal() declare public readonly chop: SimpleSignal<number, this>;
  @initial(1400) @signal() declare public readonly span: SimpleSignal<number, this>;
  @initial(1200) @signal() declare public readonly depth: SimpleSignal<number, this>;

  public constructor({
    water = palette.sea,
    surface = palette.foam,
    surfaceWidth = 0,
    ...props
  }: WaveProps = {}) {
    super(props);
    const surfacePoints = () => this.sample();
    this.add(
      <>
        <Line
          points={() => {
            const pts = surfacePoints();
            const d = this.depth();
            return [...pts, [pts.at(-1)![0], d], [pts[0][0], d]];
          }}
          closed
          fill={water}
          opacity={() => (this.depth() > 0 ? 1 : 0)}
        />
        <Line
          points={surfacePoints}
          stroke={surface}
          lineWidth={surfaceWidth}
          opacity={() => (unwrapWidth(surfaceWidth) > 0 ? 1 : 0)}
          lineCap="round"
          lineJoin="round"
        />
      </>,
    );
  }

  /** Surface height at local x (negative = up, like all canvas y values). */
  public heightAt(x: number): number {
    const k = (2 * Math.PI) / this.wavelength();
    const theta = k * x - this.phase();
    const p = this.sharpness();
    const shaped = p === 1 ? Math.sin(theta) : 2 * ((1 + Math.sin(theta)) / 2) ** p - 1;
    let y = this.amplitude() * shaped;
    const chop = this.chop();
    if (chop > 0) {
      for (const [a, kr, speed, offset] of CHOP) {
        y +=
          chop *
          this.amplitude() *
          a *
          Math.sin(k * kr * x - this.phase() * speed + offset);
      }
    }
    return -y;
  }

  /** Surface slope angle at local x, in degrees — for rotating things that ride the wave. */
  public slopeAt(x: number): number {
    const dx = 2;
    const dy = this.heightAt(x + dx) - this.heightAt(x - dx);
    return (Math.atan2(dy, 2 * dx) * 180) / Math.PI;
  }

  private sample(): [number, number][] {
    const span = this.span();
    const steps = Math.max(24, Math.round(span / 10));
    return Array.from({length: steps + 1}, (_, i) => {
      const x = -span / 2 + (span * i) / steps;
      return [x, this.heightAt(x)];
    });
  }
}
