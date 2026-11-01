import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const DOT = 2;

// The ". . . ." that runs from an item to its price on a receipt. It fills whatever room the row leaves it.
export function DottedLeader() {
  return (
    <View style={styles.leader}>
      <Svg width="100%" height={DOT} accessible={false}>
        <Line
          x1={DOT / 2}
          y1={DOT / 2}
          x2="100%"
          y2={DOT / 2}
          stroke={Colors.line}
          strokeWidth={DOT}
          strokeLinecap="round"
          strokeDasharray={`0 ${DOT * 2.5}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  leader: { flex: 1, minWidth: 12, alignSelf: 'flex-end', marginBottom: 5 },
});
