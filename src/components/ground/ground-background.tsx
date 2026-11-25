import { useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ground, type GroundPalette } from '@/constants/theme';
import { useLightMode } from '@/light-mode/light-mode-provider';
import type { LightMode } from '@/utils/light-mode';

const LIGHT_CHANGE_MS = 600;

const stains = (stain: string, spots: readonly string[]) =>
  spots.map((spot) => `radial-gradient(${spot}, ${stain}, transparent 70%)`);

// Drawn natively as a few large gradients. A repeated texture (like fine concrete grain) was dropped:
// thousands of tiny tiles across a long feed made scrolling stutter.
function groundGradients(mode: LightMode, ground: GroundPalette, screenTop: number) {
  const spots =
    mode === 'day'
      ? [
          [82, 330, '90px 46px'],
          [12, 870, '70px 40px'],
          [70, 1320, '120px 60px'],
        ]
      : [
          [82, 450, '90px 46px'],
          [14, 960, '70px 40px'],
        ];
  const positioned = spots.map(([x, y, size]) => `${size} at ${x}% ${screenTop + Number(y)}px`);
  const streetlight = ground.streetlight
    ? [`radial-gradient(80% 450px at 50% ${screenTop}px, ${ground.streetlight}, transparent 72%)`]
    : [];
  return [...streetlight, ...stains(ground.stain, positioned)].join(', ');
}

function GroundLayer({ mode, screenTop }: { mode: LightMode; screenTop: number }) {
  const ground = Ground[mode];
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: ground.ground, backgroundImage: groundGradients(mode, ground, screenTop) },
      ]}
    />
  );
}

// The forecourt behind a screen's content: concrete by day, asphalt under a streetlight at night.
// It scrolls with the content, so the stains stay put on the ground rather than floating over it.
// It reaches a screen's height above the content, so the ground runs up behind the status bar and through
// pull-to-refresh, and at least a screen below it, so short content still stands on concrete all the way down.
export function GroundBackground() {
  const { mode } = useLightMode();
  const { height: windowHeight } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();
  // On iOS the content starts below the status bar; on Android it starts at the top of the screen.
  const screenTop = windowHeight - (Platform.OS === 'ios' ? topInset : 0);
  const [shownMode, setShownMode] = useState(mode);
  const [changedWhileOpen, setChangedWhileOpen] = useState(false);
  if (mode !== shownMode) {
    setShownMode(mode);
    setChangedWhileOpen(true);
  }

  return (
    <View
      testID="ground-background"
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { top: -windowHeight, minHeight: 2 * windowHeight }]}>
      <Animated.View
        key={mode}
        entering={changedWhileOpen ? FadeIn.duration(LIGHT_CHANGE_MS) : undefined}
        exiting={FadeOut.duration(LIGHT_CHANGE_MS)}
        style={StyleSheet.absoluteFill}>
        <GroundLayer mode={mode} screenTop={screenTop} />
      </Animated.View>
    </View>
  );
}
