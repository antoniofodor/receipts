import { StyleSheet, Text, View } from 'react-native';

import type { Rule } from '@/api/rules';
import { PressableScale } from '@/components/pressable-scale';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { TextField } from '@/components/text-fields';
import { MutedText } from '@/components/typography';
import { RULE_TITLE_MAX_LENGTH } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import { formatPoints, pluralize, pointsColor } from '@/utils/format';
import type { RuleKind } from '@/utils/points';
import { canCreateRuleNamed, normaliseRuleTitle, rulesOfKind, searchRules } from '@/utils/rule-search';

const KIND_NAMES: Record<RuleKind, { button: string; singular: string; plural: string }> = {
  penalty: { button: 'Penalty', singular: 'penalty', plural: 'penalties' },
  bonus: { button: 'Bonus', singular: 'bonus', plural: 'bonuses' },
};
const OTHER_KIND: Record<RuleKind, RuleKind> = { penalty: 'bonus', bonus: 'penalty' };

type RulePickerProps = {
  rules: Rule[];
  kind: RuleKind;
  query: string;
  onChangeQuery: (query: string) => void;
  onPickRule: (rule: Rule) => void;
  onCreateRule: (title: string) => void;
};

export function RulePicker({ rules, kind, query, onChangeQuery, onPickRule, onCreateRule }: RulePickerProps) {
  const results = searchRules(rulesOfKind(rules, kind), query);
  const otherKind = OTHER_KIND[kind];
  const other = KIND_NAMES[otherKind];
  const otherKindMatches = query.trim() ? searchRules(rulesOfKind(rules, otherKind), query).length : 0;
  const newTitle = normaliseRuleTitle(query);
  const canCreate = canCreateRuleNamed(rules, query);

  return (
    <View style={sharedStyles.stack}>
      <TextField
        value={query}
        onChangeText={onChangeQuery}
        placeholder={`Search ${KIND_NAMES[kind].plural}, or type a new one`}
        maxLength={RULE_TITLE_MAX_LENGTH}
        autoCorrect={false}
        accessibilityLabel="Search rules"
      />
      {results.length > 0 || canCreate ? (
        <View>
          {results.map((rule, index) => (
            <PressableScale
              key={rule.id}
              accessibilityRole="button"
              accessibilityLabel={`${rule.title}, ${formatPoints(rule.points)}`}
              onPress={() => onPickRule(rule)}
              pressedScale={0.98}
              style={[styles.row, index > 0 && styles.ruled]}>
              {index > 0 ? <DashedRule /> : null}
              <LineItem
                label={rule.title}
                value={
                  <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>
                    {formatPoints(rule.points)}
                  </Text>
                }
              />
            </PressableScale>
          ))}
          {canCreate ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Create rule ${newTitle}`}
              onPress={() => onCreateRule(newTitle)}
              pressedScale={0.98}
              style={[styles.row, results.length > 0 && styles.ruled]}>
              {results.length > 0 ? <DashedRule /> : null}
              <Text style={styles.createText}>+ New rule &ldquo;{newTitle}&rdquo;</Text>
            </PressableScale>
          ) : null}
        </View>
      ) : null}
      {otherKindMatches > 0 ? (
        <MutedText>
          {`Also matches ${pluralize(otherKindMatches, other.singular, other.plural)}. Tap ${other.button} to see ${otherKindMatches === 1 ? 'it' : 'them'}.`}
        </MutedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, justifyContent: 'center', paddingVertical: Spacing.sm },
  ruled: { gap: Spacing.sm, paddingTop: 0 },
  createText: { fontFamily: Fonts.bold, fontSize: 13, textTransform: 'uppercase', color: Paper.red },
});
