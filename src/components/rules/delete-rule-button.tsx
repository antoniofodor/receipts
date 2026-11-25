import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { useDeleteRule } from '@/hooks/use-delete-rule';

type DeleteRuleButtonProps = {
  ruleId: string;
  onDeleted: () => void;
};

export function DeleteRuleButton({ ruleId, onDeleted }: DeleteRuleButtonProps) {
  const deleteRule = useDeleteRule();
  return (
    <ConfirmDeleteButton
      label="Delete rule"
      confirmTitle="Delete this rule?"
      confirmMessage="Entries already logged with it stay."
      onConfirm={async () => {
        await deleteRule(ruleId);
        onDeleted();
      }}
    />
  );
}
