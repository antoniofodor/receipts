import { getRules } from '@/api/rules';
import { RuleGroup } from '@/components/rules/rule-group';
import { Screen } from '@/components/screen';
import { ErrorText, Title } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';

export default function RulesScreen() {
  const { data: rules, error, refreshing, refresh } = useTripQuery(getRules);
  const penalties = rules?.filter((rule) => rule.points < 0) ?? [];
  const bonusesBiggestFirst = rules?.filter((rule) => rule.points > 0).reverse() ?? [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title subtitle="Shared by everyone on the trip. Anyone can add a rule while logging points.">Rulebook</Title>
      <ErrorText>{error}</ErrorText>
      <RuleGroup title="Penalties" rules={penalties} />
      <RuleGroup title="Bonuses" rules={bonusesBiggestFirst} />
    </Screen>
  );
}
