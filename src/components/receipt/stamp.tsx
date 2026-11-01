import { StyleSheet, Text, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { Colors, Fonts } from '@/constants/theme';

const TILT = '-7deg';

const STAMP_IN = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 2.2 }, { rotate: TILT }] },
  55: { opacity: 0.95, transform: [{ scale: 0.93 }, { rotate: TILT }] },
  100: { opacity: 0.85, transform: [{ scale: 1 }, { rotate: TILT }] },
}).duration(500);

export function Stamp({ label }: { label: string }) {
  return (
    <Animated.View entering={STAMP_IN} pointerEvents="none" style={styles.stamp}>
      <View style={styles.inner}>
        <Text style={styles.text}>{label}</Text>
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
    borderWidth: 2,
    borderRadius: 4,
    borderColor: Colors.red,
    opacity: 0.85,
    transform: [{ rotate: TILT }],
  },
  inner: { borderWidth: 1, borderRadius: 2, borderColor: Colors.red, paddingHorizontal: 9, paddingVertical: 4 },
  text: { fontFamily: Fonts.heavy, fontSize: 16, letterSpacing: 3, color: Colors.red },
});
