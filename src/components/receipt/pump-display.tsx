import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

const ROLL_DISTANCE = 18;
const ROLL_UP = FadeInUp.duration(260).withInitialValues({ transform: [{ translateY: ROLL_DISTANCE }] });
const ROLL_DOWN = FadeInDown.duration(260).withInitialValues({ transform: [{ translateY: -ROLL_DISTANCE }] });

type PumpDisplayProps = {
  label: string;
  unit?: string;
  value: string;
  negative?: boolean;
  // Which way the digits roll when the value changes: up for more, down for less.
  direction?: number;
};

// The fuel pump's lit display: negative amounts glow red, everything else glows white.
export function PumpDisplay({ label, unit = 'pts', value, negative = false, direction = 0 }: PumpDisplayProps) {
  const entering = direction > 0 ? ROLL_UP : direction < 0 ? ROLL_DOWN : undefined;
  return (
    <View style={styles.panel}>
      <View style={styles.labels}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.label}>{unit}</Text>
      </View>
      <View style={styles.window}>
        <Animated.Text key={value} entering={entering} style={[styles.digits, negative ? styles.led : styles.light]}>
          {value}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: Colors.pump,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.pumpEdge,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  label: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.pumpLabel,
  },
  window: { overflow: 'hidden', alignItems: 'flex-end' },
  digits: { fontFamily: Fonts.bold, fontSize: 40, lineHeight: 46, fontVariant: ['tabular-nums'] },
  led: { color: Colors.pumpLed, textShadowColor: Colors.pumpLedGlow, textShadowRadius: 10 },
  light: { color: Colors.pumpLight, textShadowColor: Colors.pumpLightGlow, textShadowRadius: 10 },
});
