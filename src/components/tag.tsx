import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

export const TAG_HEIGHT = 20;

type TagProps = {
  label: string;
  color?: string;
  // Something small in front of the label, like an avatar. It must fit inside the tag's height.
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

// The small printed tags on a receipt. One fixed height, so tags side by side always line up.
export function Tag({ label, color = Colors.muted, leading, style, accessibilityLabel }: TagProps) {
  return (
    <View
      style={[styles.tag, leading ? styles.withLeading : null, style]}
      accessible
      accessibilityLabel={accessibilityLabel ?? label}>
      {leading}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    height: TAG_HEIGHT,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.sm - 2,
    paddingHorizontal: 6,
  },
  withLeading: { paddingLeft: 3 },
  label: {
    flexShrink: 1,
    fontFamily: Fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
