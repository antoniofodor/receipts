import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { NewPackRule } from '@/api/custom-packs';
import type { RulePack } from '@/api/rule-packs';
import { Card } from '@/components/card';
import { PickAllButton } from '@/components/custom-packs/pick-all-button';
import { RuleChecklist } from '@/components/custom-packs/rule-checklist';
import { PressableScale } from '@/components/pressable-scale';
import { LineItem } from '@/components/receipt/line-item';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing, Type } from '@/constants/theme';
import type { RuleSelection } from '@/hooks/use-rule-selection';
import { pluralize } from '@/utils/format';

type PresetPackChecklistProps = {
  preset: RulePack;
  selection: RuleSelection;
  alreadyIn: (rule: NewPackRule) => boolean;
  onAdd: (rule: NewPackRule) => void;
};

// One preset pack, folded down to its name until it's opened to pick from.
export function PresetPackChecklist({ preset, selection, alreadyIn, onAdd }: PresetPackChecklistProps) {
  const [open, setOpen] = useState(false);
  const pickedCount = preset.rules.filter((rule) => !alreadyIn(rule) && selection.isPicked(rule)).length;
  const summary = pluralize(preset.rules.length, 'rule', 'rules') + (pickedCount > 0 ? ` · ${pickedCount} picked` : '');
  const toggle = () => setOpen((wasOpen) => !wasOpen);

  return (
    <Card seed={`pick-${preset.id}`}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${preset.name}, ${summary}`}
        accessibilityState={{ expanded: open }}
        onPress={toggle}
        feedback="tick"
        pressedScale={0.98}>
        <LineItem label={preset.name} labelStyle={styles.packName} value={<Text style={Type.label}>{summary}</Text>} />
      </PressableScale>
      {open ? <RuleChecklist rules={preset.rules} selection={selection} alreadyIn={alreadyIn} onAdd={onAdd} /> : null}
      <View style={[sharedStyles.row, styles.footer]}>
        {open ? (
          <PickAllButton onPress={() => selection.pickAll(preset.rules.filter((rule) => !alreadyIn(rule)))} />
        ) : null}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${open ? 'Hide' : 'See'} the ${preset.name} rules`}
          onPress={toggle}
          feedback="tick"
          hitSlop={8}>
          <Text style={styles.toggle}>{open ? 'Hide rules' : 'See rules'}</Text>
        </PressableScale>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  packName: { ...Type.name, fontSize: 20, lineHeight: 22 },
  footer: { justifyContent: 'flex-end', gap: Spacing.lg },
  toggle: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Paper.red },
});
