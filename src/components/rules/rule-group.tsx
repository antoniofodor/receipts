import { StyleSheet, Text, View } from 'react-native';

import type { Rule } from '@/api/rules';
import { AnimatedListItem } from '@/components/animated-list-item';
import { Card } from '@/components/card';
import { PressableScale } from '@/components/pressable-scale';
import { LineItem } from '@/components/receipt/line-item';
import { SectionLabel } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

type RuleGroupProps = {
  title: string;
  rules: Rule[];
  onPressRule: (rule: Rule) => void;
};

export function RuleGroup({ title, rules, onPressRule }: RuleGroupProps) {
  if (rules.length === 0) return null;
  return (
    <View style={sharedStyles.stack}>
      <SectionLabel count={rules.length}>{title}</SectionLabel>
      <Card flush style={styles.list}>
        {rules.map((rule, index) => (
          <AnimatedListItem key={rule.id} index={index}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Log ${rule.title}, ${formatPoints(rule.points)}`}
              onPress={() => onPressRule(rule)}
              pressedScale={0.98}
              style={styles.row}>
              <LineItem
                label={rule.title}
                value={
                  <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>
                    {formatPoints(rule.points)}
                  </Text>
                }
              />
              {rule.is_preset ? null : <Text style={styles.addedTag}>Added on the trip</Text>}
            </PressableScale>
          </AnimatedListItem>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  row: { paddingVertical: Spacing.md - 1, gap: 2 },
  addedTag: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.red,
  },
});
