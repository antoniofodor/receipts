import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { SignStrip } from '@/components/ground/sign-letters';
import { Fonts, Spacing, type GroundPalette } from '@/constants/theme';
import { useThemedStyles } from '@/light-mode/use-themed-styles';
import { crookedLetterIndex, signTileHeight, signWords } from '@/utils/sign-letters';

const SIGN_PADDING = 5;

type SignTitleProps = {
  children: string;
  eyebrow?: string;
  right?: ReactNode;
  tileHeight?: number;
};

// The screen's heading, spelled out in plastic letters slid into a sign.
export function SignTitle({ children, eyebrow, right, tileHeight = 40 }: SignTitleProps) {
  const styles = useThemedStyles(makeStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [rowWidth, setRowWidth] = useState(windowWidth - 2 * Spacing.lg);
  const [rightWidth, setRightWidth] = useState(0);
  const words = signWords(children);
  const roomForSign = rowWidth - (right ? rightWidth + Spacing.md : 0) - 2 * SIGN_PADDING;
  const height = signTileHeight(words, tileHeight, roomForSign);

  return (
    <View style={styles.block}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <View style={styles.row} onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}>
        <View accessible accessibilityRole="header" accessibilityLabel={children} style={styles.words}>
          {words.map((word, wordIndex) => (
            <SignStrip key={wordIndex} text={word} height={height} crookedIndex={crookedLetterIndex(word)} />
          ))}
        </View>
        {right ? <View onLayout={(event) => setRightWidth(event.nativeEvent.layout.width)}>{right}</View> : null}
      </View>
    </View>
  );
}

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    block: { gap: Spacing.sm },
    eyebrow: {
      fontFamily: Fonts.semiBold,
      fontSize: 10.5,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: ground.textMuted,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
    words: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1 },
  });
