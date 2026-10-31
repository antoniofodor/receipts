import type { PropsWithChildren } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

export function AnimatedListItem({ children }: PropsWithChildren) {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
      {children}
    </Animated.View>
  );
}
