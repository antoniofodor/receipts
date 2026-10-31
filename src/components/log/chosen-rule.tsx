import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors } from '@/constants/theme';

type ChosenRuleProps = {
  title: string;
  isNew: boolean;
  onChange: () => void;
  children?: ReactNode;
};

export function ChosenRule({ title, isNew, onChange, children }: ChosenRuleProps) {
  return (
    <Card>
      <View style={[sharedStyles.row, styles.header]}>
        <Label>{isNew ? 'New rule' : 'Rule'}</Label>
        <Pressable accessibilityRole="button" accessibilityLabel="Change rule" onPress={onChange} hitSlop={12}>
          <Text style={styles.change}>Change</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { justifyContent: 'space-between' },
  change: { fontSize: 15, fontWeight: '600', color: Colors.accent },
  title: { fontSize: 18, fontWeight: '700', color: Colors.ink },
});
