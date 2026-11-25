import { router } from 'expo-router';

import type { Rule } from '@/api/rules';
import { tripQueries } from '@/api/trip-queries';
import { logHrefWithRule } from '@/components/log/log-route';
import { RuleActions } from '@/components/rules/rule-actions';
import { RuleGroup } from '@/components/rules/rule-group';
import { Screen } from '@/components/screen';
import { NeonSign } from '@/components/ground/neon-sign';
import { SignTitle } from '@/components/ground/sign-title';
import { ErrorText, MutedText } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { canManageRule } from '@/utils/rule-permissions';
import { rulesOfKind } from '@/utils/rule-search';

export default function RulesScreen() {
  const membership = useMembership();
  const { data: rules, error, refreshing, refresh } = useTripQuery(tripQueries.rules);
  const penalties = rulesOfKind(rules ?? [], 'penalty');
  const bonuses = rulesOfKind(rules ?? [], 'bonus');
  const logWithRule = (rule: Rule) => router.push(logHrefWithRule(rule));
  const editRule = (rule: Rule) => router.push({ pathname: '/rule/[id]', params: { id: rule.id } });
  const canEditRule = (rule: Rule) => canManageRule(rule, membership);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <SignTitle eyebrow={rules ? `${rules.length} rules` : undefined} right={<NeonSign small>No refunds</NeonSign>}>
        Rules
      </SignTitle>
      <RuleActions tripId={membership.trip_id} />
      <ErrorText>{error}</ErrorText>
      {rules?.length === 0 ? <MutedText>No rules yet</MutedText> : null}
      <RuleGroup
        title="Penalties"
        rules={penalties}
        onPressRule={logWithRule}
        onEditRule={editRule}
        canEditRule={canEditRule}
      />
      <RuleGroup
        title="Bonuses"
        rules={bonuses}
        onPressRule={logWithRule}
        onEditRule={editRule}
        canEditRule={canEditRule}
      />
    </Screen>
  );
}
