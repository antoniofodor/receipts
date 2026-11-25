import { useMemo, type PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PaperWear } from '@/components/receipt/paper-wear';
import { TornEdge } from '@/components/receipt/torn-edge';
import { Paper, Spacing, Wear } from '@/constants/theme';
import { useGround } from '@/light-mode/light-mode-provider';
import { SurfaceContext } from '@/light-mode/surface';
import { receiptWear, type WearLevel } from '@/utils/receipt-wear';

const TAPE_WIDTH = 74;

type CardProps = PropsWithChildren<{
  // What the receipt's tape and crease are picked from, so it looks the same every time.
  seed: string;
  wear?: WearLevel;
  style?: StyleProp<ViewStyle>;
  // Lists of rows run edge to edge; everything else gets the receipt's margins.
  flush?: boolean;
}>;

// Every card is a receipt torn off the roll.
export function Card({ children, seed, wear = 'full', style, flush = false }: CardProps) {
  const ground = useGround();
  const worn = useMemo(() => receiptWear(seed, wear), [seed, wear]);
  const yellowed = worn.creaseAt !== null;
  return (
    <View>
      <TornEdge side="top" color={yellowed ? Wear.yellowedEdgeTop : Paper.paper} />
      {/* Without its own stacking context, Fabric hoists a plain view's children into the screen and measures them
          there, so when something above moved the card, every animated row in it sprang after it on its own. */}
      <View
        collapsable={false}
        style={[styles.paper, { boxShadow: ground.cardShadow }, !flush && styles.padded, style]}>
        <PaperWear wear={worn} />
        <SurfaceContext value="paper">{children}</SurfaceContext>
      </View>
      <TornEdge color={yellowed ? Wear.yellowedEdgeBottom : Paper.paper} />
      {worn.taped ? (
        <View
          testID="receipt-tape"
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={styles.tape}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: Paper.paper },
  padded: { padding: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
  tape: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -TAPE_WIDTH / 2,
    width: TAPE_WIDTH,
    height: 22,
    backgroundColor: Wear.tape,
    boxShadow: Wear.tapeShadow,
    transform: [{ rotate: '-3deg' }],
  },
});
