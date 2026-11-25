import { router } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { MyRulePacks } from '@/components/custom-packs/my-rule-packs';
import { RulePackActions } from '@/components/rule-packs/rule-pack-actions';
import { RulePackCard } from '@/components/rule-packs/rule-pack-card';
import { Screen } from '@/components/screen';
import { TapeLabel } from '@/components/tape-label';
import { SignTitle } from '@/components/ground/sign-title';
import { ErrorText, MutedText } from '@/components/typography';
import { useRulePacks } from '@/hooks/use-rule-packs';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { canManageRulePacks, presetPackRef } from '@/utils/rule-packs';

export default function RulePacksScreen() {
  const membership = useMembership();
  const { packs, error } = useRulePacks();
  const { data: tripRules, error: rulesError } = useTripQuery(tripQueries.rules);
  const canManage = canManageRulePacks(membership);

  return (
    <Screen>
      <BackLink label="Close" onPress={() => router.back()} />
      <SignTitle>Rule packs</SignTitle>
      {canManage ? null : <MutedText>Only the organiser can add or remove rule packs.</MutedText>}
      <ErrorText>{error ?? rulesError}</ErrorText>
      <MyRulePacks tripRules={canManage ? (tripRules ?? null) : null} />
      <TapeLabel>Preset packs</TapeLabel>
      {packs?.map((pack) => (
        <RulePackCard
          key={pack.id}
          pack={pack}
          action={canManage && tripRules ? <RulePackActions pack={presetPackRef(pack)} tripRules={tripRules} /> : null}
        />
      ))}
    </Screen>
  );
}
