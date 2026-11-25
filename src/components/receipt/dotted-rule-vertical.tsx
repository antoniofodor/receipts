import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Paper } from '@/constants/theme';

const DOT = 2;

// A dotted line down the left of a block. Drawn, because iOS won't dot a border on one side only.
export function VerticalDottedRule() {
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={styles.rule}>
      <Svg width={DOT} height="100%">
        <Line
          x1={DOT / 2}
          y1={DOT / 2}
          x2={DOT / 2}
          y2="100%"
          stroke={Paper.dots}
          strokeWidth={DOT}
          strokeLinecap="round"
          strokeDasharray={`0 ${DOT * 2.5}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  rule: { position: 'absolute', left: 0, top: 0, bottom: 0, width: DOT },
});
