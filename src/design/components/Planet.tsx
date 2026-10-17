import {Circle, colorSignal, initial, Node, NodeProps, signal} from '@motion-canvas/2d';
import {
  Color,
  ColorSignal,
  PossibleColor,
  SignalValue,
  SimpleSignal,
} from '@motion-canvas/core';
import {palette} from '../theme';

export interface PlanetProps extends NodeProps {
  radius?: SignalValue<number>;
  color?: SignalValue<PossibleColor>;
  /** Soft halo around the body — use for stars and glowing things. */
  glow?: SignalValue<number>;
}

/**
 * A flat-shaded sphere: base colour, a shadow crescent and a highlight.
 * Works for planets, stars, cells, atoms… anything round.
 */
export class Planet extends Node {
  @initial(160)
  @signal()
  declare public readonly radius: SimpleSignal<number, this>;

  @initial(palette.sky)
  @colorSignal()
  declare public readonly color: ColorSignal<this>;

  @initial(0)
  @signal()
  declare public readonly glow: SimpleSignal<number, this>;

  public constructor(props: PlanetProps = {}) {
    super(props);
    const d = () => this.radius() * 2;
    const shade = () => new Color(this.color()).darken(0.9);
    const light = () => new Color(this.color()).brighten(0.8);

    this.add(
      <>
        <Circle
          size={() => d() * (1 + this.glow())}
          fill={this.color}
          opacity={() => (this.glow() > 0 ? 0.25 : 0)}
          shadowColor={this.color}
          shadowBlur={() => this.radius() * this.glow()}
        />
        <Circle size={d} fill={this.color} clip>
          <Circle
            size={() => d() * 1.15}
            x={() => this.radius() * 0.55}
            y={() => this.radius() * 0.45}
            fill={shade}
            opacity={0.55}
          />
          <Circle
            size={() => d() * 0.28}
            x={() => -this.radius() * 0.42}
            y={() => -this.radius() * 0.42}
            fill={light}
            opacity={0.5}
          />
        </Circle>
      </>,
    );
  }
}
