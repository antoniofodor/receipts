import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import type { haptics } from '@/components/haptics';
import { PressableScale } from '@/components/pressable-scale';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  feedback?: keyof typeof haptics;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  feedback = 'tap',
}: ButtonProps) {
  const inactive = disabled || loading;
  const textColor = variant === 'secondary' ? Colors.ink : Colors.onAccent;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      feedback={feedback}
      style={[styles.button, styles[variant], inactive && styles.inactive]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[Type.button, { color: textColor }]}>{title}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primary: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  secondary: { backgroundColor: 'transparent', borderColor: Colors.ink },
  danger: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  inactive: { opacity: 0.4 },
});
