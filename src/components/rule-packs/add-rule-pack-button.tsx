import { View } from 'react-native';

import { Button } from '@/components/button';
import { ErrorText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { useAddRulePack } from '@/hooks/use-add-rule-pack';
import { useAsyncAction } from '@/hooks/use-async-action';
import { pluralize } from '@/utils/format';
import { rulesMissingFromTrip, type PackRef } from '@/utils/rule-packs';

type AddRulePackButtonProps = {
  pack: PackRef;
  tripRules: { title: string }[];
};

export function AddRulePackButton({ pack, tripRules }: AddRulePackButtonProps) {
  const addRulePack = useAddRulePack();
  const { error, run } = useAsyncAction();
  // No spinner: the rules join the cache at once, which leaves nothing missing and turns the button off.
  const missing = rulesMissingFromTrip(pack, tripRules);

  return (
    <View style={sharedStyles.stack}>
      <Button
        title={missing.length > 0 ? `Add ${pluralize(missing.length, 'rule', 'rules')}` : 'All added'}
        onPress={() => run(() => addRulePack(pack))}
        disabled={missing.length === 0}
        feedback="success"
      />
      <ErrorText>{error}</ErrorText>
    </View>
  );
}
