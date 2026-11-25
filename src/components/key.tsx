import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressableScale, type PressableScaleProps } from '@/components/pressable-scale';
import { Radius, Spacing, Springs } from '@/constants/theme';

export const KEY_HEIGHT = 52;
const KEY_EDGE = 5;
const KEY_DROP = 3;

type KeyProps = Omit<PressableScaleProps, 'style' | 'children' | 'pressedScale'> & {
  face: string;
  edge: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// A chunky pump key: the face sits on a darker edge and drops onto it under the thumb.
export function Key({ face, edge, children, style, onPressIn, onPressOut, ...props }: KeyProps) {
  const pressed = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pressed.get() * KEY_DROP }] }));
  return (
    <PressableScale
      {...props}
      pressedScale={1}
      onPressIn={(event) => {
        pressed.set(withSpring(1, Springs.press));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.set(withSpring(0, Springs.press));
        onPressOut?.(event);
      }}
      style={[styles.key, { backgroundColor: edge }, style]}>
      <Animated.View style={[styles.face, { backgroundColor: face }, faceStyle]}>{children}</Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  key: { borderRadius: Radius.key, paddingBottom: KEY_EDGE },
  face: {
    minHeight: KEY_HEIGHT,
    borderRadius: Radius.key,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundImage: 'radial-gradient(22px 10px at 30% 80%, rgba(255, 255, 255, 0.14), transparent 70%)',
  },
});
