import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { Fonts, Type } from '@/constants/theme';
import { useSurfaceColors } from '@/light-mode/surface';

export function Label({ children }: PropsWithChildren) {
  const { muted } = useSurfaceColors();
  return <Text style={[Type.label, { color: muted }]}>{children}</Text>;
}

export function MutedText({ children, style }: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  const { muted } = useSurfaceColors();
  return <Text style={[Type.muted, { color: muted }, style]}>{children}</Text>;
}

export function ErrorText({ children }: { children: string | null }) {
  const { error } = useSurfaceColors();
  if (!children) return null;
  return (
    <Text accessibilityRole="alert" style={[styles.error, { color: error }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 19 },
});
