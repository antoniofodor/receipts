import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export function BackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onPress} hitSlop={12}>
      <Text style={styles.text}>{'‹'} Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16, color: Colors.accent, fontWeight: '600' },
});
