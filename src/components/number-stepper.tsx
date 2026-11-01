import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { PumpDisplay } from '@/components/receipt/pump-display';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type NumberStepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  format?: (value: number) => string;
};

// The value sits on a pump display and rolls the way it moved.
export function NumberStepper({ value, min, max, onChange, label, unit, format = String }: NumberStepperProps) {
  const [direction, setDirection] = useState(0);

  function step(by: number) {
    setDirection(by);
    onChange(value + by);
  }

  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${format(value)}`}>
      <StepButton symbol={'−'} label={`Decrease ${label}`} disabled={value <= min} onPress={() => step(-1)} />
      <PumpDisplay label={label} unit={unit} value={format(value)} negative={value < 0} direction={direction} />
      <StepButton symbol="+" label={`Increase ${label}`} disabled={value >= max} onPress={() => step(1)} />
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
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      pressedScale={0.88}
      feedback="tick"
      style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.symbol}>{symbol}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  button: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.3 },
  symbol: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.ink },
});
