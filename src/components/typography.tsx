import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function MutedText({ children, style }: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <Text accessibilityRole="alert" style={styles.error}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  titleBlock: { gap: Spacing.xs, flexShrink: 1 },
  title: { fontSize: 30, fontWeight: '900', color: Colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.muted, lineHeight: 21 },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  muted: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  error: { color: Colors.danger, fontSize: 14, fontWeight: '600' },
});
