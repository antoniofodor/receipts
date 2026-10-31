import { router } from 'expo-router';

import { getRules, type Rule } from '@/api/rules';
import { logHrefWithRule } from '@/components/log/log-route';
import { AddRuleCard } from '@/components/rules/add-rule-card';
import { RuleGroup } from '@/components/rules/rule-group';
import { Screen } from '@/components/screen';
import { ErrorText, Title } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { rulesOfKind } from '@/utils/rule-search';

export default function RulesScreen() {
  const membership = useMembership();
  const { data: rules, error, refreshing, refresh } = useTripQuery(getRules);
  const penalties = rulesOfKind(rules ?? [], 'penalty');
  const bonuses = rulesOfKind(rules ?? [], 'bonus');
  const logWithRule = (rule: Rule) => router.push(logHrefWithRule(rule));

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title subtitle="Shared by everyone on the trip. Tap a rule to log it.">Rulebook</Title>
      <AddRuleCard tripId={membership.trip_id} onAdded={refresh} />
      <ErrorText>{error}</ErrorText>
      <RuleGroup title="Penalties" rules={penalties} onPressRule={logWithRule} />
      <RuleGroup title="Bonuses" rules={bonuses} onPressRule={logWithRule} />
    </Screen>
  );
}
