import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/components/haptics';
import { Springs } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  feedback?: keyof typeof haptics | 'none';
};

// Everything tappable gives a little under the thumb and springs back, with a light tap.
export function PressableScale({
  style,
  pressedScale = 0.97,
  feedback = 'tap',
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        scale.set(withSpring(pressedScale, Springs.press));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, Springs.press));
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (feedback !== 'none') haptics[feedback]();
        onPress?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
