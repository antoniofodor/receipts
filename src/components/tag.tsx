import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Paper } from '@/constants/theme';

export const TAG_HEIGHT = 22;

export type TagKind = 'pending' | 'approved' | 'declined' | 'outline';

type TagProps = {
  label: string;
  kind?: TagKind;
  // Something small in front of the label, like an avatar. It must fit inside the tag's height.
  leading?: ReactNode;
  accessibilityLabel?: string;
};

// The small boxed labels on a receipt. One fixed height, so tags side by side always line up.
export function Tag({ label, kind = 'outline', leading, accessibilityLabel }: TagProps) {
  return (
    <View
      style={[styles.tag, styles[kind], leading ? styles.withLeading : null]}
      accessible
      accessibilityLabel={accessibilityLabel ?? label}>
      {leading}
      <Text style={[styles.label, { color: LABEL_COLORS[kind] }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const LABEL_COLORS: Record<TagKind, string> = {
  pending: Paper.ink,
  approved: Paper.green,
  declined: Paper.red,
  outline: Paper.ink,
};

const styles = StyleSheet.create({
  tag: {
    height: TAG_HEIGHT,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    paddingHorizontal: 7,
  },
  pending: { borderColor: Paper.ink, backgroundColor: Paper.highlight },
  approved: { borderColor: Paper.green },
  declined: { borderColor: Paper.red },
  outline: { borderColor: Paper.ink },
  withLeading: { paddingLeft: 3 },
  label: {
    flexShrink: 1,
    fontFamily: Fonts.heavy,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
