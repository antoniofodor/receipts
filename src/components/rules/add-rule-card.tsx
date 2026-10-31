import { useState } from 'react';

import { createRule } from '@/api/rules';
import { tripQueries } from '@/api/trip-queries';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { RulePointsFields } from '@/components/rules/rule-points-fields';
import { TextField } from '@/components/text-fields';
import { ErrorText, Label } from '@/components/typography';
import { DEFAULT_NEW_RULE_MAGNITUDE, RULE_TITLE_MAX_LENGTH, RULE_TITLE_MIN_LENGTH } from '@/constants/game-rules';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { signedPoints, type RuleKind } from '@/utils/points';
import { normaliseRuleTitle } from '@/utils/rule-search';

export function AddRuleCard({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<RuleKind>('penalty');
  const [magnitude, setMagnitude] = useState(DEFAULT_NEW_RULE_MAGNITUDE);
  const { busy, error, run } = useAsyncAction();
  const invalidate = useInvalidateTripQueries();
  const updateOptimistically = useOptimisticTripUpdate();
  const { player_id: myPlayerId } = useMembership();

  if (!open) return <Button title="Add a rule" variant="secondary" onPress={() => setOpen(true)} />;

  function save() {
    run(async () => {
      const rule = { title: normaliseRuleTitle(title), points: signedPoints(kind, magnitude) };
      const id = await createRule(tripId, rule.title, rule.points);
      await updateOptimistically(tripQueries.rules, (rules) => [
        ...rules,
        { ...rule, id, is_preset: false, created_by: myPlayerId, created_at: new Date().toISOString() },
      ]);
      setTitle('');
      setOpen(false);
      invalidate([tripQueries.rules]);
    });
  }

  return (
    <Card>
      <Label>New rule</Label>
      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Ordering pineapple on pizza"
        maxLength={RULE_TITLE_MAX_LENGTH}
        autoFocus
        accessibilityLabel="Rule name"
      />
      <RulePointsFields kind={kind} magnitude={magnitude} onChangeKind={setKind} onChangeMagnitude={setMagnitude} />
      <ErrorText>{error}</ErrorText>
      <Button
        title="Save rule"
        onPress={save}
        loading={busy}
        disabled={normaliseRuleTitle(title).length < RULE_TITLE_MIN_LENGTH}
      />
      <Button title="Cancel" variant="secondary" onPress={() => setOpen(false)} />
    </Card>
  );
}
