import {Layout, LayoutProps, Rect, Txt} from '@motion-canvas/2d';
import {colors, space, text} from '../theme';

export interface TitleProps extends LayoutProps {
  title: string;
  subtitle?: string;
  accent?: string;
}

/** Big headline + optional kicker line + accent bar. */
export function Title({title, subtitle, accent = colors.primary, ...props}: TitleProps) {
  return (
    <Layout layout direction="column" alignItems="center" gap={space(3)} {...props}>
      <Txt {...text.hero} text={title} textAlign="center" />
      <Rect width={space(20)} height={space(1)} radius={space(1)} fill={accent} />
      {subtitle && (
        <Txt {...text.h3} fill={colors.textMuted} text={subtitle} textAlign="center" />
      )}
    </Layout>
  );
}
