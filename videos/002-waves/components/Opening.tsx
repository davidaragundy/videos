import {Line, Node, Rect} from '@motion-canvas/2d';
import {all, Color, createRef, createSignal, ThreadGenerator} from '@motion-canvas/core';
import {Background, Cloud, drive, float, gradients, palette, Sea, Sun} from '@design';
import {Surfer} from './Surfer';

const WATERLINE = 270;
const SURFER_X = 130;
const WAVELENGTH = 1150;
// Put the front crest just left of the surfer so they sit on the steep face.
const PHASE = ((2 * Math.PI) / WAVELENGTH) * -110 - Math.PI / 2 - Sea.frontPhaseOffset(3);

const wrap = (x: number, span = 1400) =>
  ((((x + span / 2) % span) + span) % span) - span / 2;

/**
 * The opening shot — a beach poster that moves: low striped sun, layered swell, a surfer on
 * the face. Used by the first AND last scene so the video loops. The "camera" rides with the
 * wave, so the front wave holds still while the far sea, foam and clouds stream past.
 */
export function createOpening() {
  const sea = createRef<Sea>();
  const surfer = createRef<Node>();
  const travel = createSignal(0);
  const [top, bottom] = gradients.beach;
  const groundAtSun = Color.lerp(top, bottom, 0.5).hex();

  const node = (
    <Node>
      <Background gradient="beach" />
      <Sun y={-60} x={190} radius={210} ground={groundAtSun} />
      <Cloud
        x={() => wrap(-240 - travel() * 0.12)}
        y={-560}
        size={340}
        color={palette.paper}
      />
      <Cloud
        x={() => wrap(330 - travel() * 0.08)}
        y={-400}
        size={240}
        color={palette.paper}
      />
      {[
        [-250, -470, 1],
        [-190, -500, 0.75],
      ].map(([x, y, s]) => (
        <Line
          x={x}
          y={y}
          scale={s}
          points={[
            [-24, -2],
            [0, 10],
            [24, -2],
          ]}
          radius={14}
          stroke={palette.ink}
          lineWidth={5}
          lineCap="round"
        />
      ))}
      <Sea
        ref={sea}
        y={WATERLINE}
        amplitude={150}
        wavelength={WAVELENGTH}
        phase={PHASE}
        sharpness={2.3}
      />
      {Array.from({length: 6}, (_, i) => {
        const x = () => wrap(i * 233 - travel());
        return (
          <Rect
            x={x}
            y={() => WATERLINE + sea().front().heightAt(x()) + 70 + (i % 3) * 80}
            width={70 + (i % 3) * 40}
            height={12}
            radius={6}
            fill={palette.foam}
            opacity={0.45}
          />
        );
      })}
      <Node
        x={SURFER_X}
        y={() => WATERLINE + sea().front().heightAt(SURFER_X) + 4}
        rotation={() => sea().slopeAt(SURFER_X) * 0.8}
      >
        <Surfer ref={surfer} />
      </Node>
    </Node>
  );

  /** Background motion. Start with `yield opening.idle()`. */
  function* idle(): ThreadGenerator {
    yield* all(drive(sea().drift, -1.6), drive(travel, 240), float(surfer(), 6, 1.6));
  }

  return {node, sea, idle, waterline: WATERLINE};
}
