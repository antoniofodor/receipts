import { StyleSheet } from 'react-native';

import { Colors, Spacing, Type } from '@/constants/theme';

export const sharedStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stack: { gap: Spacing.sm },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  pointsText: { ...Type.points, fontSize: 16 },
});
