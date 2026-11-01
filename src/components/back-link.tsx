import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export function BackLink({ onPress, label = 'Back' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => pressed && styles.pressed}>
      <Text style={styles.text}>
        {'‹'} {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.5 },
  text: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: Colors.ink },
});
