import { StyleSheet, Text, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { Fonts, Paper } from '@/constants/theme';

const TILT = '-10deg';
const RESTING_OPACITY = 0.88;

const STAMP_IN = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 2.2 }, { rotate: TILT }] },
  55: { opacity: 0.95, transform: [{ scale: 0.93 }, { rotate: TILT }] },
  100: { opacity: RESTING_OPACITY, transform: [{ scale: 1 }, { rotate: TILT }] },
}).duration(500);

// A red rubber stamp across the receipt. The status tag already says the same for screen readers.
// still: already on the paper when it's drawn, for a picture that mustn't catch it mid-landing.
export function Stamp({ label, detail, still = false }: { label: string; detail?: string; still?: boolean }) {
  return (
    <Animated.View
      entering={still ? undefined : STAMP_IN}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.stamp}>
      <View style={styles.inner}>
        <Text style={styles.label}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: 'absolute',
    top: 40,
    right: 14,
    padding: 2,
    borderWidth: 2.5,
    borderRadius: 4,
    borderColor: Paper.red,
    opacity: RESTING_OPACITY,
    transform: [{ rotate: TILT }],
  },
  inner: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: Paper.red,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: { fontFamily: Fonts.heavy, fontSize: 17, letterSpacing: 3, color: Paper.red },
  detail: { fontFamily: Fonts.bold, fontSize: 8.5, letterSpacing: 1.5, color: Paper.red },
});
