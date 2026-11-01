import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const TOOTH_WIDTH = 12;
export const TOOTH_DEPTH = 6;

// The zig-zag a receipt gets when it's torn off the roll, drawn in the paper's color below it.
export function TornEdge({ color = Colors.card }: { color?: string }) {
  return (
    <Svg width="100%" height={TOOTH_DEPTH} accessible={false} importantForAccessibility="no-hide-descendants">
      <Defs>
        <Pattern id="teeth" width={TOOTH_WIDTH} height={TOOTH_DEPTH} patternUnits="userSpaceOnUse">
          <Path d={`M0 0 L${TOOTH_WIDTH / 2} ${TOOTH_DEPTH} L${TOOTH_WIDTH} 0 Z`} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={TOOTH_DEPTH} fill="url(#teeth)" />
    </Svg>
  );
}
