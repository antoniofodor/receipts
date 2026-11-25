import { RulePointsFields } from '@/components/rules/rule-points-fields';
import { TextField } from '@/components/text-fields';
import { RULE_TITLE_MAX_LENGTH } from '@/constants/game-rules';
import type { RuleDraft } from '@/hooks/use-rule-draft';

type RuleFieldsProps = {
  draft: RuleDraft;
  autoFocus?: boolean;
};

export function RuleFields({ draft, autoFocus = false }: RuleFieldsProps) {
  return (
    <>
      <TextField
        value={draft.title}
        onChangeText={draft.setTitle}
        placeholder="e.g. Ordering pineapple on pizza"
        maxLength={RULE_TITLE_MAX_LENGTH}
        autoFocus={autoFocus}
        accessibilityLabel="Rule name"
      />
      <RulePointsFields
        kind={draft.kind}
        magnitude={draft.magnitude}
        onChangeKind={draft.setKind}
        onChangeMagnitude={draft.setMagnitude}
      />
    </>
  );
}
