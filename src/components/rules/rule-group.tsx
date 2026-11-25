import { StyleSheet, Text, View } from 'react-native';

import type { Rule } from '@/api/rules';
import { AnimatedListItem } from '@/components/animated-list-item';
import { Card } from '@/components/card';
import { haptics } from '@/components/haptics';
import { PressableScale, type PressableScaleProps } from '@/components/pressable-scale';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { TapeLabel } from '@/components/tape-label';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

type RuleGroupProps = {
  title: string;
  rules: Rule[];
  onPressRule: (rule: Rule) => void;
  // Long-press, or the screen reader's long-press action, on a rule this player may change.
  onEditRule: (rule: Rule) => void;
  canEditRule: (rule: Rule) => boolean;
};

export function RuleGroup({ title, rules, onPressRule, onEditRule, canEditRule }: RuleGroupProps) {
  if (rules.length === 0) return null;
  return (
    <View style={sharedStyles.stack}>
      <TapeLabel count={rules.length}>{title}</TapeLabel>
      <Card seed={title} flush style={styles.list}>
        {rules.map((rule, index) => (
          <AnimatedListItem key={rule.id} index={index}>
            {index > 0 ? <DashedRule /> : null}
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Log ${rule.title}, ${formatPoints(rule.points)}`}
              onPress={() => onPressRule(rule)}
              {...editGestures(canEditRule(rule), () => onEditRule(rule))}
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

function editGestures(editable: boolean, edit: () => void): Partial<PressableScaleProps> {
  if (!editable) return {};
  return {
    onLongPress: () => {
      haptics.tap();
      edit();
    },
    accessibilityActions: [{ name: 'longpress', label: 'Edit rule' }],
    onAccessibilityAction: (event) => {
      if (event.nativeEvent.actionName === 'longpress') edit();
    },
  };
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  row: { minHeight: 44, justifyContent: 'center', paddingVertical: Spacing.sm + 2, gap: 2 },
  addedTag: {
    fontFamily: Fonts.heavy,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.red,
  },
});
