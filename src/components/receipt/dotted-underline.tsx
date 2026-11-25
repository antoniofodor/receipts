import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Paper } from '@/constants/theme';

const DOT = 2;

// A dotted line to write on, like the blanks on a printed form.
export function DottedUnderline() {
  return (
    <View pointerEvents="none" accessible={false} style={styles.line}>
      <Svg width="100%" height={DOT}>
        <Line
          x1={DOT / 2}
          y1={DOT / 2}
          x2="100%"
          y2={DOT / 2}
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
  line: { height: DOT },
});
