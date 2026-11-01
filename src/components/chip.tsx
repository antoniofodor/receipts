import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      feedback="tick"
      style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.card,
  },
  selected: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  text: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: Colors.ink },
  selectedText: { color: Colors.onAccent },
});
