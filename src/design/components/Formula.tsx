import {Latex, LatexProps} from '@motion-canvas/2d';
import {colors} from '../theme';

/** Height of one line of maths per tier. */
const heights = {sm: 56, md: 84, lg: 120} as const;

export interface FormulaProps extends LatexProps {
  /** Rendered height of the equation. */
  tier?: keyof typeof heights;
  /**
   * LaTeX is sized by its total height, so stacked maths (fractions, roots over fractions,
   * exponents) needs more room to keep the same glyph size: ~2 for a fraction, ~1.3 for a
   * superscript.
   */
  rows?: number;
}

/** House-styled LaTeX equation: `<Formula tex="c = \\sqrt{g h}" />`. */
export function Formula({tier = 'md', rows = 1, ...props}: FormulaProps) {
  return <Latex fill={colors.text} height={formulaHeight(tier, rows)} {...props} />;
}

/** Height for a formula of `rows` lines at `tier` — use when morphing `tex` to a taller one. */
export function formulaHeight(tier: keyof typeof heights = 'md', rows = 1) {
  return heights[tier] * rows;
}
