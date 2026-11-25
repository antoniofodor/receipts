import { StyleSheet, Text, View } from 'react-native';

import type { PackRule } from '@/api/rule-packs';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { sharedStyles } from '@/constants/styles';
import { Spacing } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';
import { rulesOfKind } from '@/utils/rule-search';

// Printed in the same order as the rulebook: penalties, then bonuses.
export function PackRuleLines({ rules }: { rules: PackRule[] }) {
  const penalties = rulesOfKind(rules, 'penalty');
  const bonuses = rulesOfKind(rules, 'bonus');
  return (
    <View style={styles.list}>
      {penalties.map((rule) => (
        <PackRuleLine key={rule.title} rule={rule} />
      ))}
      {penalties.length > 0 && bonuses.length > 0 ? <DashedRule /> : null}
      {bonuses.map((rule) => (
        <PackRuleLine key={rule.title} rule={rule} />
      ))}
    </View>
  );
}

function PackRuleLine({ rule }: { rule: PackRule }) {
  return (
    <LineItem
      label={rule.title}
      value={
        <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>{formatPoints(rule.points)}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
});
