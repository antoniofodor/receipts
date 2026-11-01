import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { DashedRule } from '@/components/receipt/dashed-rule';
import { Colors, Fonts, Spacing, Type } from '@/constants/theme';

type TitleProps = {
  children: ReactNode;
  eyebrow?: string;
  subtitle?: ReactNode;
};

export function Title({ children, eyebrow, subtitle }: TitleProps) {
  return (
    <View style={styles.titleBlock}>
      {eyebrow ? <Text style={Type.label}>{eyebrow}</Text> : null}
      <Text style={Type.display} accessibilityRole="header">
        {children}
      </Text>
      {subtitle ? <Text style={Type.muted}>{subtitle}</Text> : null}
    </View>
  );
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={Type.label}>{children}</Text>;
}

// A section heading printed across the receipt roll: LABEL (count) - - - - -
export function SectionLabel({ children, count }: PropsWithChildren<{ count?: number }>) {
  return (
    <View style={styles.sectionRow}>
      <Text style={Type.label}>
        {children}
        {count !== undefined ? <Text style={styles.count}>{` (${count})`}</Text> : null}
      </Text>
      <View style={styles.sectionRule}>
        <DashedRule />
      </View>
    </View>
  );
}

export function MutedText({ children, style }: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return <Text style={[Type.muted, style]}>{children}</Text>;
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
  titleBlock: { gap: Spacing.xs },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  sectionRule: { flex: 1 },
  count: { color: Colors.red, fontFamily: Fonts.bold },
  error: { fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 19, color: Colors.danger },
});
