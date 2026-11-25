import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Fonts, Paper } from '@/constants/theme';

type VoteTallyDotsProps = {
  confirms: number;
  votesNeeded: number;
  size?: 'small' | 'regular';
  // Prints "1 of 3 approvals" beside the boxes.
  showCount?: boolean;
};

const TICK_SIZE = { small: 8, regular: 11 };

// One box per approval needed, ticked off as they come in.
export function VoteTallyDots({ confirms, votesNeeded, size = 'regular', showCount = false }: VoteTallyDotsProps) {
  const side = TICK_SIZE[size];
  const count = `${confirms} of ${votesNeeded} approvals`;
  return (
    <View style={styles.row} accessible accessibilityLabel={count}>
      {Array.from({ length: votesNeeded }, (_, index) => (
        <View key={index} style={[styles.box, { width: side, height: side }]}>
          {index < confirms ? <Animated.View entering={ZoomIn.springify()} style={styles.fill} /> : null}
        </View>
      ))}
      {showCount ? <Text style={styles.count}>{count}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  box: { borderWidth: 1.5, borderColor: Paper.ink, overflow: 'hidden' },
  count: {
    marginLeft: 5,
    fontFamily: Fonts.heavy,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Paper.muted,
  },
  fill: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, backgroundColor: Paper.ink },
});
