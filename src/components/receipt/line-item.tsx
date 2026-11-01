import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { DottedLeader } from '@/components/receipt/dotted-leader';
import { Spacing, Type } from '@/constants/theme';

type LineItemProps = {
  label: string;
  value: ReactNode;
  labelStyle?: StyleProp<TextStyle>;
};

// A receipt line: what, a dotted leader, then the amount on the right.
export function LineItem({ label, value, labelStyle }: LineItemProps) {
  return (
    <View style={styles.row}>
      <Text style={[Type.lineItem, styles.label, labelStyle]}>{label}</Text>
      <DottedLeader />
      {value}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  label: { flexShrink: 1 },
});
