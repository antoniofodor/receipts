import type { PropsWithChildren } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GroundBackground } from '@/components/ground/ground-background';
import { ScreenBottomSpace, Spacing, type GroundPalette } from '@/constants/theme';
import { RevealFocusedInputContext, useFocusedInputAboveKeyboard } from '@/hooks/use-focused-input-above-keyboard';
import { useGround } from '@/light-mode/light-mode-provider';
import { useThemedStyles } from '@/light-mode/use-themed-styles';

type ScreenProps = PropsWithChildren<{
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

// The ScrollView must be the screen's first child: on iOS, native tabs and UIKit then inset it
// for the status bar, tab bar and keyboard automatically. Android insets the tab bar itself
// but not the status bar or system navigation bar, so those are padded by hand.
// The ground is drawn inside the scrolled content, to keep the ScrollView first.
export function Screen({ children, refreshing = false, onRefresh }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);
  const ground = useGround();
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
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ground.textMuted} />
        ) : undefined
      }>
      <GroundBackground />
      <RevealFocusedInputContext value={reveal}>{children}</RevealFocusedInputContext>
    </ScrollView>
  );
}

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: ground.ground },
    content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: ScreenBottomSpace },
  });
