import Svg, { Line } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const THICKNESS = 1.5;

// Drawn rather than a dashed border: iOS won't dash a border on one side only.
export function DashedRule({ color = Colors.line }: { color?: string }) {
  return (
    <Svg width="100%" height={THICKNESS} accessible={false}>
      <Line
        x1="0"
        y1={THICKNESS / 2}
        x2="100%"
        y2={THICKNESS / 2}
        stroke={color}
        strokeWidth={THICKNESS}
        strokeDasharray="5 4"
      />
    </Svg>
  );
}
