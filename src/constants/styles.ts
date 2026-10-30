import { StyleSheet } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export const sharedStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stack: { gap: Spacing.sm },
  mono: { fontFamily: Fonts.mono },
  list: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  pointsText: { fontFamily: Fonts.mono, fontSize: 17, fontWeight: '800' },
});
