import { View } from 'react-native';

import type { Rule } from '@/api/rules';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { AddRulePackButton } from '@/components/rule-packs/add-rule-pack-button';
import { sharedStyles } from '@/constants/styles';
import { useRemoveRulePack } from '@/hooks/use-remove-rule-pack';
import { pluralize } from '@/utils/format';
import { rulesFromPack, type PackRef } from '@/utils/rule-packs';

// What the organiser can do with a pack: add what's missing, or take every rule from it back out.
export function RulePackActions({ pack, tripRules }: { pack: PackRef; tripRules: Rule[] }) {
  const removeRulePack = useRemoveRulePack();
  const onTrip = rulesFromPack(pack, tripRules).length;
  const rules = pluralize(onTrip, 'rule', 'rules');

  return (
    <View style={sharedStyles.stack}>
      <AddRulePackButton pack={pack} tripRules={tripRules} />
      {onTrip > 0 ? (
        <ConfirmDeleteButton
          label={`Remove ${rules}`}
          confirmTitle={`Remove ${pack.name}?`}
          confirmMessage={`This removes the ${rules} that came from ${pack.name}, including any you've edited. Entries already logged keep their points.`}
          confirmLabel="Remove"
          busyLabel="Removing…"
          onConfirm={() => removeRulePack(pack)}
        />
      ) : null}
    </View>
  );
}
