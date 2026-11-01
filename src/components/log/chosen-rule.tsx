import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { LineItem } from '@/components/receipt/line-item';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Type } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

type ChosenRuleProps = {
  title: string;
  points: number;
  isNew: boolean;
  onChange: () => void;
  children?: ReactNode;
};

// The entry counts exactly these points: to log a different amount, pick or create another rule.
export function ChosenRule({ title, points, isNew, onChange, children }: ChosenRuleProps) {
  return (
    <Card>
      <View style={[sharedStyles.row, styles.header]}>
        <Label>{isNew ? 'New rule' : 'Rule'}</Label>
        <Pressable accessibilityRole="button" accessibilityLabel="Change rule" onPress={onChange} hitSlop={12}>
          <Text style={styles.change}>Change</Text>
        </Pressable>
      </View>
      <LineItem
        label={title}
        labelStyle={styles.title}
        value={<Text style={[Type.points, { color: pointsColor(points) }]}>{formatPoints(points)}</Text>}
      />
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { justifyContent: 'space-between' },
  change: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.ink },
  title: { fontSize: 16 },
});
