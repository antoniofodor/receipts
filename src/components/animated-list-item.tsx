import type { PropsWithChildren } from 'react';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Springs } from '@/constants/theme';

const STAGGER_MS = 60;
const MAX_STAGGERED = 6;

// Rows feed down into place like a receipt coming out of the printer, one after another.
const printIn = (index: number) =>
  FadeInDown.duration(420)
    .delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS)
    .withInitialValues({ transform: [{ translateY: -12 }] });

const settle = LinearTransition.springify().damping(Springs.settle.damping).stiffness(Springs.settle.stiffness);

export function AnimatedListItem({ children, index = 0 }: PropsWithChildren<{ index?: number }>) {
  return (
    <Animated.View entering={printIn(index)} exiting={FadeOut.duration(180)} layout={settle}>
      {children}
    </Animated.View>
  );
}
