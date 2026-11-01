import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { TornEdge } from '@/components/receipt/torn-edge';
import { Colors, Spacing } from '@/constants/theme';

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  // Lists of rows run edge to edge; everything else gets the receipt's margins.
  flush?: boolean;
}>;

// Every card is a receipt torn off the roll.
export function Card({ children, style, flush = false }: CardProps) {
  return (
    <View>
      <View style={[styles.paper, !flush && styles.padded, style]}>{children}</View>
      <TornEdge />
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: Colors.card },
  padded: { padding: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
});
