import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { barcodeBars, barcodeCaption } from '@/utils/barcode';

// Decoration only: the same id always prints the same bars, so a receipt looks the same every time.
export function Barcode({ seed }: { seed: string }) {
  return (
    <View style={styles.block} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.bars}>
        {barcodeBars(seed).map((bar, index) => (
          <View key={index} style={[styles.bar, { width: bar.width, marginRight: bar.gap }]} />
        ))}
      </View>
      <Text style={styles.caption}>{barcodeCaption(seed)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', gap: 4 },
  bars: { flexDirection: 'row', height: 44 },
  bar: { backgroundColor: Colors.ink },
  caption: { fontFamily: Fonts.regular, fontSize: 10, letterSpacing: 3.5, color: Colors.muted },
});
