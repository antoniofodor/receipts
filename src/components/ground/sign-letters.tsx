import { StyleSheet, Text, View } from 'react-native';

import { Radius, SignTiles, Type } from '@/constants/theme';
import { TILE_GAP, TILE_WIDTH_RATIO } from '@/utils/sign-letters';

type SignLettersProps = {
  text: string;
  height: number;
  // A letter knocked crooked in its slot.
  crookedIndex?: number;
};

// A row of white plastic letter tiles. Spaces are empty slots. Decoration: whatever shows it reads the words aloud.
export function SignLetters({ text, height, crookedIndex = -1 }: SignLettersProps) {
  const slot = { height, minWidth: height * TILE_WIDTH_RATIO };
  const letterSize = { fontSize: height * 0.84, lineHeight: height };
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {[...text.toUpperCase()].map((letter, index) =>
        letter === ' ' ? (
          <View key={index} style={slot} />
        ) : (
          <View key={index} style={[styles.tile, slot, index === crookedIndex && styles.crooked]}>
            <Text style={[Type.signLetter, letterSize]}>{letter}</Text>
          </View>
        ),
      )}
    </View>
  );
}

// Letters slid into a dark sign strip.
export function SignStrip(props: SignLettersProps) {
  return (
    <View style={styles.strip}>
      <SignLetters {...props} />
    </View>
  );
}

const STRIP_PADDING = 5;

const styles = StyleSheet.create({
  strip: {
    padding: STRIP_PADDING,
    borderRadius: 4,
    backgroundColor: SignTiles.tileBack,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: TILE_GAP },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
    backgroundColor: SignTiles.tile,
    borderWidth: 1,
    borderColor: SignTiles.tileEdge,
    borderRadius: Radius.tile,
    boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.12)',
  },
  crooked: { transform: [{ rotate: '7deg' }, { translateY: 2 }] },
});
