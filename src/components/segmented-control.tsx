import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/components/haptics';
import { Icon, type IconName } from '@/components/icon';
import { Fonts, Paper, Radius } from '@/constants/theme';

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string; icon?: IconName }[];
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
            {option.icon ? <Icon name={option.icon} size={14} color={selected ? Paper.paper : Paper.muted} /> : null}
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
    borderWidth: 2,
    borderColor: Paper.ink,
    borderRadius: Radius.sm,
    padding: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    gap: 6,
    borderRadius: Radius.sm - 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: Paper.ink },
  label: {
    fontFamily: Fonts.heavy,
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.muted,
  },
  selectedLabel: { color: Paper.paper },
});
