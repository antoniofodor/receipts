import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

type NumberStepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  format?: (value: number) => string;
};

export function NumberStepper({ value, min, max, onChange, label, format = String }: NumberStepperProps) {
  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${format(value)}`}>
      <StepButton
        symbol={'−'}
        label={`Decrease ${label}`}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
      />
      <Text style={styles.value}>{format(value)}</Text>
      <StepButton symbol="+" label={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function StepButton({
  symbol,
  label,
  disabled,
  onPress,
}: {
  symbol: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.symbol}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontFamily: Fonts.mono, fontSize: 36, fontWeight: '800', color: Colors.accent },
  button: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
  symbol: { fontSize: 24, fontWeight: '700', color: Colors.ink },
});
