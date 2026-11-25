import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { PumpDisplay } from '@/components/receipt/pump-display';
import { Fonts, Paper, Radius, Spacing } from '@/constants/theme';

type NumberStepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
};

// The value sits on a pump display and rolls the way it moved.
export function NumberStepper({ value, min, max, onChange, label, unit }: NumberStepperProps) {
  const [direction, setDirection] = useState(0);

  function step(by: number) {
    setDirection(by);
    onChange(value + by);
  }

  return (
    <View style={styles.row}>
      <StepButton symbol={'−'} label={`Decrease ${label}`} disabled={value <= min} onPress={() => step(-1)} />
      <View style={styles.display}>
        <PumpDisplay cells={[{ label, unit, value, direction }]} />
      </View>
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
  display: { flex: 1 },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Paper.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.3 },
  symbol: { fontFamily: Fonts.bold, fontSize: 22, color: Paper.ink },
});
