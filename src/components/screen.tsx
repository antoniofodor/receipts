import type { PropsWithChildren } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, ScreenBottomSpace, Spacing } from '@/constants/theme';
import { RevealFocusedInputContext, useFocusedInputAboveKeyboard } from '@/hooks/use-focused-input-above-keyboard';

type ScreenProps = PropsWithChildren<{
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

// The ScrollView must be the screen's first child: on iOS, native tabs and UIKit then inset it
// for the status bar, tab bar and keyboard automatically. Android insets the tab bar itself
// but not the status bar or system navigation bar, so those are padded by hand.
export function Screen({ children, refreshing = false, onRefresh }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { scrollRef, onScroll, reveal } = useFocusedInputAboveKeyboard();
  const androidInsets =
    Platform.OS === 'ios'
      ? null
      : { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + ScreenBottomSpace };

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={32}
      style={styles.screen}
      contentContainerStyle={[styles.content, androidInsets]}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}>
      <RevealFocusedInputContext value={reveal}>{children}</RevealFocusedInputContext>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: ScreenBottomSpace },
});
