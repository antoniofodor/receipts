import { StyleSheet, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type VoteTallyDotsProps = {
  confirms: number;
  votesNeeded: number;
  size?: 'small' | 'regular';
};

export function VoteTallyDots({ confirms, votesNeeded, size = 'regular' }: VoteTallyDotsProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${confirms} of ${votesNeeded} confirms`}>
      {Array.from({ length: votesNeeded }, (_, index) => (
        <View key={index} style={[styles[size], index < confirms && styles.filled]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regular: { width: 18, height: 8, borderRadius: Radius.pill, backgroundColor: Colors.line },
  small: { width: 10, height: 6, borderRadius: Radius.pill, backgroundColor: Colors.line },
  filled: { backgroundColor: Colors.plus },
});
