import {Layout, LayoutProps, Line, Txt} from '@motion-canvas/2d';
import {colors, space, text} from '../theme';
import {useFrame} from '../utils/frame';

export interface ChapterTagProps extends LayoutProps {
  index: number;
  title: string;
  /** `light` for dark grounds, `dark` for light grounds. */
  tone?: 'light' | 'dark';
}

/**
 * Editorial chapter marker, set vertically up the left edge like a poster's date line:
 * "01 —— BIRTH". Shows progress without shouting.
 */
export function ChapterTag({index, title, tone = 'light', ...props}: ChapterTagProps) {
  const frame = useFrame();
  const fill = tone === 'light' ? colors.text : colors.textDark;
  return (
    <Layout
      layout
      direction="row"
      alignItems="center"
      gap={space(2)}
      rotation={-90}
      x={frame.safe.left - space(1)}
      y={frame.vertical ? -space(30) : 0}
      {...props}
    >
      <Txt {...text.label} fill={fill} text={String(index).padStart(2, '0')} />
      <Line
        points={[
          [0, 0],
          [space(8), 0],
        ]}
        stroke={fill}
        lineWidth={2}
      />
      <Txt {...text.label} fill={fill} text={title.toUpperCase()} />
    </Layout>
  );
}
