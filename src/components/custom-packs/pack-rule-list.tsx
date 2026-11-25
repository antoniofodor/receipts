import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CustomPack, CustomPackRule } from '@/api/custom-packs';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { PressableScale } from '@/components/pressable-scale';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { RuleFields } from '@/components/rules/rule-fields';
import { screenReaderSwipeActions, SwipeableRow } from '@/components/swipeable-row';
import { ErrorText, MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Spacing } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useCustomPackChanges } from '@/hooks/use-custom-packs';
import { useRuleDraft } from '@/hooks/use-rule-draft';
import { formatPoints, pointsColor } from '@/utils/format';

// The pack's rules as receipt lines. Tapping one opens it for editing in place; swiping it left removes it.
export function PackRuleList({ pack }: { pack: CustomPack }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const changes = useCustomPackChanges();
  const { error, run } = useAsyncAction();
  if (pack.rules.length === 0) return <MutedText>No rules yet</MutedText>;
  return (
    <Card seed={`pack-rules-${pack.id}`}>
      {pack.rules.map((rule, index) => (
        <View key={rule.id} style={styles.line}>
          {index > 0 ? <DashedRule /> : null}
          {editingId === rule.id ? (
            <PackRuleEditor packId={pack.id} rule={rule} onDone={() => setEditingId(null)} />
          ) : (
            <PackRuleLine
              rule={rule}
              onEdit={() => setEditingId(rule.id)}
              onRemove={() => run(() => changes.removeRule(pack.id, rule.id))}
            />
          )}
        </View>
      ))}
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}

type PackRuleLineProps = { rule: CustomPackRule; onEdit: () => void; onRemove: () => void };

function PackRuleLine({ rule, onEdit, onRemove }: PackRuleLineProps) {
  const swipe = { swipeLeft: { label: 'Remove', tone: 'remove', onAction: onRemove } } as const;
  return (
    <SwipeableRow {...swipe}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Edit ${rule.title}, ${formatPoints(rule.points)}`}
        {...screenReaderSwipeActions(swipe)}
        onPress={onEdit}
        pressedScale={0.98}
        style={styles.row}>
        <LineItem
          label={rule.title}
          value={
            <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>
              {formatPoints(rule.points)}
            </Text>
          }
        />
      </PressableScale>
    </SwipeableRow>
  );
}

function PackRuleEditor({ packId, rule, onDone }: { packId: string; rule: CustomPackRule; onDone: () => void }) {
  const draft = useRuleDraft(rule);
  const changes = useCustomPackChanges();
  const { busy, error, run } = useAsyncAction();
  const unchanged = draft.rule.title === rule.title && draft.rule.points === rule.points;

  function save() {
    run(async () => {
      await changes.updateRule(packId, rule.id, draft.rule);
      onDone();
    });
  }

  return (
    <View style={styles.editor}>
      <RuleFields draft={draft} autoFocus />
      <ErrorText>{error}</ErrorText>
      <Button title="Save rule" onPress={save} loading={busy} disabled={!draft.hasTitle || unchanged} />
      <Button title="Cancel" variant="secondary" onPress={onDone} />
      <ConfirmDeleteButton
        label="Remove from pack"
        confirmTitle={`Remove "${rule.title}"?`}
        confirmMessage="Trips that already use this pack keep the rule."
        confirmLabel="Remove"
        busyLabel="Removing…"
        onConfirm={() => changes.removeRule(packId, rule.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  line: { gap: Spacing.sm },
  row: { minHeight: 44, justifyContent: 'center' },
  editor: { gap: Spacing.md, paddingVertical: Spacing.sm },
});
