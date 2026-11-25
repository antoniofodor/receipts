import { StyleSheet, View } from 'react-native';

import { Wear } from '@/constants/theme';
import type { ReceiptWear } from '@/utils/receipt-wear';

const YELLOWED_DEPTH = 60;

function creaseGradients(creaseAt: number) {
  return [
    `linear-gradient(96deg, transparent ${creaseAt - 3}%, ${Wear.creaseShadow} ${creaseAt - 0.5}%, ` +
      `${Wear.creaseLight} ${creaseAt + 0.5}%, transparent ${creaseAt + 3}%)`,
    `linear-gradient(-6deg, transparent 58%, ${Wear.creaseFaint} 60%, transparent 62%)`,
  ].join(', ');
}

// A fold crease and yellowed ends, clipped to the paper and drawn under what's printed.
export function PaperWear({ wear }: { wear: ReceiptWear }) {
  if (wear.creaseAt === null) return null;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.layer, { backgroundImage: creaseGradients(wear.creaseAt) }]}>
      <View style={[styles.yellowed, styles.top]} />
      <View style={[styles.yellowed, styles.bottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  yellowed: { position: 'absolute', left: 0, right: 0, height: YELLOWED_DEPTH },
  top: { top: 0, backgroundImage: `linear-gradient(${Wear.yellowedTop}, transparent)` },
  bottom: { bottom: 0, backgroundImage: `linear-gradient(transparent, ${Wear.yellowedBottom})` },
});
