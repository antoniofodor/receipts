import { router, useLocalSearchParams } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { EditRuleForm } from '@/components/rules/edit-rule-form';
import { Screen } from '@/components/screen';
import { SignTitle } from '@/components/ground/sign-title';
import { ErrorText, MutedText } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { canManageRule } from '@/utils/rule-permissions';

export default function EditRuleScreen() {
  const membership = useMembership();
  const { id: ruleId } = useLocalSearchParams<{ id: string }>();
  const { data: rules, error } = useTripQuery(tripQueries.rules);
  const rule = rules?.find((candidate) => candidate.id === ruleId);

  return (
    <Screen>
      <BackLink label="Close" onPress={() => router.back()} />
      <SignTitle>Edit rule</SignTitle>
      <ErrorText>{error}</ErrorText>
      {rules && !rule ? <MutedText>This rule isn&apos;t here anymore.</MutedText> : null}
      {rule && !canManageRule(rule, membership) ? (
        <MutedText>Only the organiser or the person who added this rule can change it.</MutedText>
      ) : null}
      {rule && canManageRule(rule, membership) ? <EditRuleForm rule={rule} onDone={() => router.back()} /> : null}
    </Screen>
  );
}
