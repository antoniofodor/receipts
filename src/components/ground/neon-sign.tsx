import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Fonts, type GroundPalette } from '@/constants/theme';
import { useGround } from '@/light-mode/light-mode-provider';
import { useThemedStyles } from '@/light-mode/use-themed-styles';
import { hashOf } from '@/utils/seed';

const UNLIT = 0.9;
const DEAD = 0.35;

const blink = (to: number, duration: number) => withTiming(to, { duration });

// Decoration only: a neon tube sign that's off by day and buzzing at night, with one dead letter.
export function NeonSign({ children, small = false }: { children: string; small?: boolean }) {
  const ground = useGround();
  const styles = useThemedStyles(makeStyles);
  const reduceMotion = useReducedMotion();
  const lit = ground.neonLit;
  const letters = [...children.toUpperCase()];
  const deadIndex = hashOf(children) % letters.length;

  const deadOpacity = useSharedValue(DEAD);
  const tubeOpacity = useSharedValue(1);
  const deadStyle = useAnimatedStyle(() => ({ opacity: deadOpacity.get() }));
  const tubeStyle = useAnimatedStyle(() => ({ opacity: tubeOpacity.get() }));

  useEffect(() => {
    if (!lit || reduceMotion) return;
    deadOpacity.set(
      withRepeat(
        withSequence(withDelay(4200, blink(UNLIT, 40)), blink(DEAD, 90), blink(UNLIT, 40), blink(DEAD, 160)),
        -1,
      ),
    );
    return () => {
      cancelAnimation(deadOpacity);
      deadOpacity.set(DEAD);
    };
  }, [lit, reduceMotion, deadOpacity]);

  const wasLit = useRef(lit);
  useEffect(() => {
    if (lit && !wasLit.current && !reduceMotion) {
      tubeOpacity.set(
        withSequence(blink(0.15, 0), blink(1, 60), blink(0.15, 90), blink(1, 60), blink(0.3, 140), blink(1, 90)),
      );
    }
    wasLit.current = lit;
  }, [lit, reduceMotion, tubeOpacity]);

  return (
    <Animated.View
      testID="neon-sign"
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tube, small && sizeStyles.smallTube, tubeStyle]}>
      <View style={sizeStyles.letters}>
        {letters.map((letter, index) =>
          lit && index === deadIndex ? (
            <Animated.Text key={index} style={[styles.letter, small && sizeStyles.smallLetter, deadStyle]}>
              {letter}
            </Animated.Text>
          ) : (
            <Text key={index} style={[styles.letter, lit && styles.glowing, small && sizeStyles.smallLetter]}>
              {letter}
            </Text>
          ),
        )}
      </View>
    </Animated.View>
  );
}

const sizeStyles = StyleSheet.create({
  letters: { flexDirection: 'row' },
  smallTube: { paddingHorizontal: 7, borderRadius: 8 },
  smallLetter: { fontSize: 15, letterSpacing: 2 },
});

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    tube: {
      alignSelf: 'center',
      borderWidth: 2,
      borderColor: ground.neon,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 2,
      transform: [{ rotate: '3deg' }],
      ...(ground.neonGlow ? { boxShadow: ground.neonGlow } : null),
    },
    letter: {
      fontFamily: Fonts.displayBold,
      fontSize: 22,
      letterSpacing: 3,
      color: ground.neon,
      opacity: ground.neonLit ? 1 : UNLIT,
    },
    glowing: { textShadowColor: ground.neon, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
  });
