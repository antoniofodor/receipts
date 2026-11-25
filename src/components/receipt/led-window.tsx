import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { makePumpStyles } from '@/components/receipt/pump-styles';
import { useThemedStyles } from '@/light-mode/use-themed-styles';

type LedWindowProps = {
  lit: string;
  // Positions not filled in yet, drawn as segments that aren't lit.
  unlit?: string;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

// Characters glowing in a pump's black LED window.
export function LedWindow({ lit, unlit = '', textStyle, accessibilityLabel }: LedWindowProps) {
  const pump = useThemedStyles(makePumpStyles);
  return (
    <View
      style={[pump.window, styles.window]}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}>
      <Text style={[pump.led, styles.text, textStyle]}>
        {lit}
        {unlit ? <Text style={pump.unlit}>{unlit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  window: { alignItems: 'center' },
  text: { fontSize: 34, lineHeight: 42, letterSpacing: 10 },
});
