import { createContext, useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
  TextInput,
} from 'react-native';

import { Spacing } from '@/constants/theme';

// Outside a Screen there's nothing to scroll, so fields can always call it.
export const RevealFocusedInputContext = createContext<() => void>(() => {});

// A field focused while the keyboard is already up, or one that just appeared (a reply box), lays out first.
const LAYOUT_SETTLE_MS = 150;

// iOS only scrolls far enough to show the caret, which can leave most of a multi-line box under the keyboard.
export function useFocusedInputAboveKeyboard() {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollY = useRef(0);

  const revealAbove = useCallback((keyboardTop: number) => {
    TextInput.State.currentlyFocusedInput()?.measureInWindow((_x, y, _width, height) => {
      const hiddenBy = y + height + Spacing.lg - keyboardTop;
      if (hiddenBy > 0) scrollRef.current?.scrollTo({ y: scrollY.current + hiddenBy });
    });
  }, []);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', (event) => revealAbove(event.endCoordinates.screenY));
    return () => subscription.remove();
  }, [revealAbove]);

  const reveal = useCallback(() => {
    setTimeout(() => {
      const keyboard = Keyboard.metrics();
      if (keyboard) revealAbove(keyboard.screenY);
    }, LAYOUT_SETTLE_MS);
  }, [revealAbove]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  return { scrollRef, onScroll, reveal };
}
