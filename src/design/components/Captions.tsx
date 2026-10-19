import {Layout, Node, NodeProps, Txt} from '@motion-canvas/2d';
import {all, createRef, ThreadGenerator} from '@motion-canvas/core';
import {colors, duration, ease, fontSize, palette, text} from '../theme';
import {useFrame} from '../utils/frame';

export type CaptionTone = 'light' | 'dark';

export interface CaptionsProps extends NodeProps {
  /** `light` text for dark grounds (default), `dark` for cream/sand grounds. */
  tone?: CaptionTone;
}

const TONES = {
  light: {base: colors.text, active: palette.apricot, shadow: '#33201B99'},
  dark: {base: colors.textDark, active: palette.coral, shadow: '#F8EFE100'},
} as const;

/**
 * Short-form captions: a few words at a time, big and box-less, with the word being spoken
 * highlighted. Fed by `voCaptions(captions())` from the voiceover timing.
 */
export class Captions extends Node {
  private readonly row = createRef<Layout>();
  private words: Txt[] = [];
  private readonly tone: CaptionTone;
  private readonly size: number;

  public constructor({tone = 'light', ...props}: CaptionsProps = {}) {
    const frame = useFrame();
    super({
      x: frame.center.x,
      // Vertical: low, in the band just above the platform's own caption/description area.
      y: frame.vertical ? frame.safe.bottom - 10 : frame.safe.bottom - 50,
      ...props,
    });
    this.tone = tone;
    this.size = frame.vertical ? fontSize.captionVertical : fontSize.caption * 1.2;
    this.add(
      <Layout
        ref={this.row}
        layout
        direction="row"
        wrap="wrap"
        justifyContent="center"
        alignItems="center"
        columnGap={this.size * 0.28}
        width={frame.vertical ? frame.safe.width : 1400}
      />,
    );
  }

  /** Swap in a new chunk of words with a soft rise. */
  public *show(words: string[]): ThreadGenerator {
    const {base, shadow} = TONES[this.tone];
    this.row().removeChildren();
    this.words = words.map(word => (
      <Txt
        {...text.caption}
        fontSize={this.size}
        fill={base}
        shadowColor={shadow}
        shadowBlur={24}
        shadowOffsetY={4}
        text={word}
        opacity={0}
        scale={0.94}
      />
    )) as Txt[];
    this.row().add(this.words);
    this.opacity(1);
    yield* all(
      ...this.words.map(w =>
        all(
          w.opacity(1, duration.fast * 0.6, ease.enter),
          w.scale(1, duration.fast, ease.pop),
        ),
      ),
    );
  }

  /** Highlight word `i` of the current chunk (−1 clears). */
  public highlight(i: number) {
    const {base, active} = TONES[this.tone];
    this.words.forEach((w, j) => w.fill(j === i ? active : base));
  }

  public *hide(): ThreadGenerator {
    yield* this.opacity(0, duration.fast * 0.6, ease.exit);
  }
}
