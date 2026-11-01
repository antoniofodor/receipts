import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

type VoteTallyDotsProps = {
  confirms: number;
  votesNeeded: number;
  size?: 'small' | 'regular';
};

const TICK_SIZE = { small: 8, regular: 11 };

// One box per approval needed, ticked off as they come in.
export function VoteTallyDots({ confirms, votesNeeded, size = 'regular' }: VoteTallyDotsProps) {
  const side = TICK_SIZE[size];
  return (
    <View style={styles.row} accessible accessibilityLabel={`${confirms} of ${votesNeeded} approvals`}>
      {Array.from({ length: votesNeeded }, (_, index) => (
        <View key={index} style={[styles.box, { width: side, height: side }]}>
          {index < confirms ? <Animated.View entering={ZoomIn.springify()} style={styles.fill} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  box: { borderRadius: 2, borderWidth: 1.5, borderColor: Colors.line, overflow: 'hidden' },
  fill: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, backgroundColor: Colors.ink },
});
