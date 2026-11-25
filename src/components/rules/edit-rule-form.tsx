import type { Rule } from '@/api/rules';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DeleteRuleButton } from '@/components/rules/delete-rule-button';
import { RuleFields } from '@/components/rules/rule-fields';
import { ErrorText, MutedText } from '@/components/typography';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useRuleDraft } from '@/hooks/use-rule-draft';
import { useUpdateRule } from '@/hooks/use-update-rule';

type EditRuleFormProps = {
  rule: Rule;
  onDone: () => void;
};

export function EditRuleForm({ rule, onDone }: EditRuleFormProps) {
  const draft = useRuleDraft(rule);
  const updateRule = useUpdateRule();
  const { busy, error, run } = useAsyncAction();
  const unchanged = draft.rule.title === rule.title && draft.rule.points === rule.points;

  function save() {
    run(async () => {
      await updateRule(rule.id, draft.rule);
      onDone();
    });
  }

  return (
    <>
      <Card seed={rule.id}>
        <RuleFields draft={draft} />
        {draft.rule.points === rule.points ? null : <MutedText>Entries already logged keep their points.</MutedText>}
        <ErrorText>{error}</ErrorText>
        <Button title="Save rule" onPress={save} loading={busy} disabled={!draft.hasTitle || unchanged} />
      </Card>
      <DeleteRuleButton ruleId={rule.id} onDeleted={onDone} />
    </>
  );
}
