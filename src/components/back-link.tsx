import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export function BackLink({ onPress, label = 'Back' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={12}>
      <Text style={styles.text}>
        {'‹'} {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 16, color: Colors.accent, fontWeight: '600' },
});
