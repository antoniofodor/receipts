import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CustomPack, NewPackRule } from '@/api/custom-packs';
import { tripQueries } from '@/api/trip-queries';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PickAllButton } from '@/components/custom-packs/pick-all-button';
import { PresetPackChecklist } from '@/components/custom-packs/preset-pack-checklist';
import { RuleChecklist } from '@/components/custom-packs/rule-checklist';
import { RuleFields } from '@/components/rules/rule-fields';
import { SegmentedControl } from '@/components/segmented-control';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { DEFAULT_NEW_RULE_MAGNITUDE } from '@/constants/game-rules';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useCustomPackChanges } from '@/hooks/use-custom-packs';
import { useRuleDraft } from '@/hooks/use-rule-draft';
import { useRulePacks } from '@/hooks/use-rule-packs';
import { useRuleSelection, type RuleSelection } from '@/hooks/use-rule-selection';
import { useTripQuery } from '@/hooks/use-trip-query';
import { packHasRuleNamed, rulesMissingFromPack } from '@/utils/custom-packs';
import { pluralize } from '@/utils/format';

type Source = 'presets' | 'trip' | 'new';

// Rules come from the preset packs, this trip's rulebook, or are typed in. Picks from different places add
// together; a name the pack already has is skipped. A rule swiped right is added on its own, straight away.
export function AddPackRules({ pack }: { pack: CustomPack }) {
  const [source, setSource] = useState<Source>('presets');
  const selection = useRuleSelection();
  const changes = useCustomPackChanges();
  const picked = useAsyncAction();
  const swiped = useAsyncAction();
  const toAdd = rulesMissingFromPack(pack, selection.rules);
  const alreadyIn = (rule: { title: string }) => packHasRuleNamed(pack, rule.title);
  const sourceProps = {
    selection,
    alreadyIn,
    onAdd: (rule: NewPackRule) => swiped.run(() => changes.addRules(pack.id, [rule])),
  };

  function addPicked() {
    picked.run(async () => {
      await changes.addRules(pack.id, toAdd);
      selection.clear();
    });
  }

  return (
    <View style={sharedStyles.stack}>
      <SegmentedControl
        options={[
          { value: 'presets', label: 'Presets' },
          { value: 'trip', label: 'This trip' },
          { value: 'new', label: 'New rule' },
        ]}
        value={source}
        onChange={setSource}
      />
      {source === 'presets' ? <PresetSources {...sourceProps} /> : null}
      {source === 'trip' ? <TripSource {...sourceProps} /> : null}
      {source === 'new' ? <NewRuleSource pack={pack} /> : null}
      {source === 'new' ? null : (
        <>
          <ErrorText>{picked.error ?? swiped.error}</ErrorText>
          <Button
            title={toAdd.length > 0 ? `Add ${pluralize(toAdd.length, 'rule', 'rules')}` : 'Pick rules to add'}
            onPress={addPicked}
            loading={picked.busy}
            disabled={toAdd.length === 0}
            feedback="success"
          />
        </>
      )}
    </View>
  );
}

type SourceProps = {
  selection: RuleSelection;
  alreadyIn: (rule: { title: string }) => boolean;
  onAdd: (rule: NewPackRule) => void;
};

function PresetSources(props: SourceProps) {
  const { packs, error } = useRulePacks();
  return (
    <>
      <ErrorText>{error}</ErrorText>
      {packs?.map((preset) => (
        <PresetPackChecklist key={preset.id} preset={preset} {...props} />
      ))}
    </>
  );
}

function TripSource({ selection, alreadyIn, onAdd }: SourceProps) {
  const { data: rules, error } = useTripQuery(tripQueries.rules);
  return (
    <>
      <ErrorText>{error}</ErrorText>
      {rules?.length === 0 ? <MutedText>No rules on this trip yet</MutedText> : null}
      {rules && rules.length > 0 ? (
        <Card seed="pick-trip-rules">
          <View style={styles.header}>
            <Label>This trip</Label>
            <PickAllButton onPress={() => selection.pickAll(rules.filter((rule) => !alreadyIn(rule)))} />
          </View>
          <RuleChecklist rules={rules} selection={selection} alreadyIn={alreadyIn} onAdd={onAdd} />
        </Card>
      ) : null}
    </>
  );
}

function NewRuleSource({ pack }: { pack: CustomPack }) {
  const draft = useRuleDraft({ title: '', points: -DEFAULT_NEW_RULE_MAGNITUDE });
  const changes = useCustomPackChanges();
  const { busy, error, run } = useAsyncAction();

  function add() {
    run(async () => {
      if (packHasRuleNamed(pack, draft.rule.title)) {
        throw new Error(`This pack already has a rule called "${draft.rule.title}"`);
      }
      await changes.addRules(pack.id, [draft.rule]);
      draft.setTitle('');
    });
  }

  return (
    <Card seed="pack-new-rule">
      <RuleFields draft={draft} />
      <ErrorText>{error}</ErrorText>
      <Button title="Add rule" onPress={add} loading={busy} disabled={!draft.hasTitle} feedback="success" />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
