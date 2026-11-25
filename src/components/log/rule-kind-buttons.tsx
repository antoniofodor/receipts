import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/components/haptics';
import { Paper, Radius, Spacing, Type } from '@/constants/theme';
import type { RuleKind } from '@/utils/points';

const KINDS: { kind: RuleKind; label: string; color: string }[] = [
  { kind: 'penalty', label: 'Penalty', color: Paper.red },
  { kind: 'bonus', label: 'Bonus', color: Paper.green },
];

type RuleKindButtonsProps = {
  value: RuleKind | null;
  onChange: (kind: RuleKind) => void;
};

// Outlined in their colour until picked, then filled with it.
export function RuleKindButtons({ value, onChange }: RuleKindButtonsProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {KINDS.map(({ kind, label, color }) => {
        const selected = value === kind;
        return (
          <Pressable
            key={kind}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => {
              haptics.tick();
              onChange(kind);
            }}
            style={({ pressed }) => [
              styles.button,
              { borderColor: color },
              selected && { backgroundColor: color },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, { color: selected ? Paper.paper : color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  button: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderRadius: Radius.key,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  label: { ...Type.key, fontSize: 18 },
});
