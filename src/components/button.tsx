import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false }: ButtonProps) {
  const inactive = disabled || loading;
  const textColor = variant === 'secondary' ? Colors.ink : Colors.onAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, styles[variant], inactive && styles.inactive, pressed && styles.pressed]}>
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line },
  danger: { backgroundColor: Colors.danger },
  inactive: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  text: { fontSize: 16, fontWeight: '700' },
});
