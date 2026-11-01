import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Barcode } from '@/components/receipt/barcode';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { Colors, Fonts, Spacing, Type } from '@/constants/theme';
import { formatReceiptDate } from '@/utils/receipt-date';

type BoardReceiptProps = PropsWithChildren<{
  tripId: string;
  tripName: string;
  joinCode: string;
  printedAt: Date;
}>;

// The whole night as one store receipt: header, a line per player, and the barcode. There is no total:
// everyone plays for themselves, so adding the players up means nothing.
export function BoardReceipt({ tripId, tripName, joinCode, printedAt, children }: BoardReceiptProps) {
  return (
    <Card>
      <View style={styles.store}>
        <Text style={Type.heading}>Receipts</Text>
        <Text style={styles.storeLine}>
          Trip #{joinCode} · {tripName}
        </Text>
        <Text style={styles.storeLine}>{formatReceiptDate(printedAt)}</Text>
      </View>
      <DashedRule />
      <View style={styles.columns}>
        <Text style={styles.column}># Player</Text>
        <Text style={styles.column}>Pts</Text>
      </View>
      {children}
      <DashedRule />
      <Text style={styles.thanks}>*** Thank you · Come again ***</Text>
      <Barcode seed={tripId} />
    </Card>
  );
}

const styles = StyleSheet.create({
  store: { alignItems: 'center', gap: 2 },
  storeLine: {
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: Colors.muted,
  },
  columns: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm },
  column: { ...Type.label, fontSize: 9.5 },
  thanks: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: Colors.muted,
  },
});
