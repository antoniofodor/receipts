import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { Paper } from '@/constants/theme';

const TOOTH_WIDTH = 12;
export const TOOTH_DEPTH = 6;

type TornEdgeProps = {
  color?: string;
  // The top edge's teeth point up, out of the receipt.
  side?: 'top' | 'bottom';
};

// The zig-zag a receipt gets when it's torn off the roll, drawn in the paper's color.
export function TornEdge({ color = Paper.paper, side = 'bottom' }: TornEdgeProps) {
  const tooth =
    side === 'bottom'
      ? `M0 0 L${TOOTH_WIDTH / 2} ${TOOTH_DEPTH} L${TOOTH_WIDTH} 0 Z`
      : `M0 ${TOOTH_DEPTH} L${TOOTH_WIDTH / 2} 0 L${TOOTH_WIDTH} ${TOOTH_DEPTH} Z`;
  const patternId = `teeth-${side}`;
  return (
    <Svg width="100%" height={TOOTH_DEPTH} accessible={false} importantForAccessibility="no-hide-descendants">
      <Defs>
        <Pattern id={patternId} width={TOOTH_WIDTH} height={TOOTH_DEPTH} patternUnits="userSpaceOnUse">
          <Path d={tooth} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={TOOTH_DEPTH} fill={`url(#${patternId})`} />
    </Svg>
  );
}
