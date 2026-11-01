import { StyleSheet, Text, View } from 'react-native';

import type { EntryStatus } from '@/api/entries';
import { Colors, Fonts, Radius } from '@/constants/theme';

const STATUS_STYLE: Record<EntryStatus, { label: string; color: string }> = {
  pending: { label: 'PENDING', color: Colors.muted },
  confirmed: { label: 'CONFIRMED', color: Colors.plus },
  rejected: { label: 'REJECTED', color: Colors.minus },
};

export function StatusPill({ status }: { status: EntryStatus }) {
  const { label, color } = STATUS_STYLE[status];
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 1 },
  text: { fontFamily: Fonts.mono, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
});
