import { createRule } from '@/api/rules';
import { tripQueries } from '@/api/trip-queries';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { RuleFields } from '@/components/rules/rule-fields';
import { ErrorText, Label } from '@/components/typography';
import { DEFAULT_NEW_RULE_MAGNITUDE } from '@/constants/game-rules';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useRuleDraft } from '@/hooks/use-rule-draft';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export function AddRuleCard({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const draft = useRuleDraft({ title: '', points: -DEFAULT_NEW_RULE_MAGNITUDE });
  const { busy, error, run } = useAsyncAction();
  const invalidate = useInvalidateTripQueries();
  const updateOptimistically = useOptimisticTripUpdate();
  const { player_id: myPlayerId } = useMembership();

  function save() {
    run(async () => {
      const { rule } = draft;
      const id = await createRule(tripId, rule.title, rule.points);
      await updateOptimistically(tripQueries.rules, (rules) => [
        ...rules,
        {
          ...rule,
          id,
          is_preset: false,
          created_by: myPlayerId,
          created_at: new Date().toISOString(),
          pack_id: null,
          custom_pack_id: null,
        },
      ]);
      onClose();
      invalidate([tripQueries.rules]);
    });
  }

  return (
    <Card seed="new-rule">
      <Label>New rule</Label>
      <RuleFields draft={draft} autoFocus />
      <ErrorText>{error}</ErrorText>
      <Button title="Save rule" onPress={save} loading={busy} disabled={!draft.hasTitle} />
      <Button title="Cancel" variant="secondary" onPress={onClose} />
    </Card>
  );
}
