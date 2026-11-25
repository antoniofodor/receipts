import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { Photo } from '@/api/photos';
import { Fonts, Paper, Spacing, Wear } from '@/constants/theme';

const EXHIBIT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type EvidencePrintProps = {
  photo: Photo;
  source: ImageSource;
  index: number;
  count: number;
};

// A full photo as a print taped to the counter, labelled like evidence. The tilt alternates so a stack looks dropped.
export function EvidencePrint({ photo, source, index, count }: EvidencePrintProps) {
  const tilt = index % 2 === 0 ? '-2.5deg' : '2deg';
  return (
    <View style={[styles.print, { transform: [{ rotate: tilt }] }]}>
      <Image
        source={source}
        style={[styles.photo, { aspectRatio: photo.width / photo.height }]}
        contentFit="contain"
        transition={150}
        accessibilityLabel={`Photo ${index + 1} of ${count}`}
      />
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={StyleSheet.absoluteFill}>
        <Text style={styles.caption}>exhibit {EXHIBIT_LETTERS[index % EXHIBIT_LETTERS.length]}</Text>
        <View style={[styles.tape, styles.tapeLeft]} />
        <View style={[styles.tape, styles.tapeRight]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  print: {
    padding: Spacing.sm,
    paddingBottom: 28,
    backgroundColor: Wear.print,
    boxShadow: Wear.printShadow,
  },
  photo: { width: '100%', backgroundColor: Paper.rule },
  caption: { position: 'absolute', left: 12, bottom: 3, fontFamily: Fonts.marker, fontSize: 15, color: Paper.ink },
  tape: {
    position: 'absolute',
    top: -8,
    width: 56,
    height: 18,
    backgroundColor: Wear.tape,
    boxShadow: Wear.tapeShadow,
  },
  tapeLeft: { left: 14, transform: [{ rotate: '-8deg' }] },
  tapeRight: { right: 14, transform: [{ rotate: '7deg' }] },
});
