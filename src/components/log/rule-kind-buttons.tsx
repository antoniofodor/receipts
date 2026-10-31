import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { RuleKind } from '@/utils/points';

const KINDS: { kind: RuleKind; label: string; color: string }[] = [
  { kind: 'penalty', label: 'Penalty', color: Colors.minus },
  { kind: 'bonus', label: 'Bonus', color: Colors.plus },
];

type RuleKindButtonsProps = {
  value: RuleKind | null;
  onChange: (kind: RuleKind) => void;
};

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
            onPress={() => onChange(kind)}
            style={({ pressed }) => [
              styles.button,
              { borderColor: color },
              selected && { backgroundColor: color },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, { color: selected ? Colors.onAccent : color }]}>{label}</Text>
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
    minHeight: 50,
    borderWidth: 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  pressed: { opacity: 0.8 },
  label: { fontSize: 16, fontWeight: '800' },
});
