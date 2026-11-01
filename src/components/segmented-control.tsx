import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/components/haptics';
import { Colors, Fonts, Radius } from '@/constants/theme';

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
            onPress={() => {
              haptics.tick();
              onChange(option.value);
            }}
            style={[styles.segment, selected && styles.selected]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    padding: 3,
  },
  segment: { flex: 1, paddingVertical: 9, borderRadius: Radius.md - 3, alignItems: 'center' },
  selected: { backgroundColor: Colors.ink },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  selectedLabel: { color: Colors.onAccent },
});
