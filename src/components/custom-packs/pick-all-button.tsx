import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/pressable-scale';
import { Fonts, Paper } from '@/constants/theme';

export function PickAllButton({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="button" onPress={onPress} feedback="tick" hitSlop={8}>
      <Text style={styles.text}>Pick all</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Paper.red },
});
