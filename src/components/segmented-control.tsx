import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selected]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: Colors.soft, borderRadius: Radius.sm, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: Radius.sm - 2, alignItems: 'center' },
  selected: { backgroundColor: Colors.card },
  label: { fontSize: 14, fontWeight: '600', color: Colors.muted },
  selectedLabel: { color: Colors.accent },
});
