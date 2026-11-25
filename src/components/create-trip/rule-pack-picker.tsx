import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CustomPack } from '@/api/custom-packs';
import type { PackRule, RulePack } from '@/api/rule-packs';
import { PressableScale } from '@/components/pressable-scale';
import { PackRuleLines } from '@/components/rule-packs/pack-rule-lines';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import { pluralize } from '@/utils/format';

type RulePackPickerProps = {
  packs: RulePack[] | null;
  error: string | null;
  pickedIds: string[];
  onToggle: (packId: string) => void;
  // The organiser's own packs, when they have an account and some packs.
  customPacks: CustomPack[] | null;
  pickedCustomIds: string[];
  onToggleCustom: (packId: string) => void;
};

// Rule packs as tick boxes on the house-rules receipt.
export function RulePackPicker({
  packs,
  error,
  pickedIds,
  onToggle,
  customPacks,
  pickedCustomIds,
  onToggleCustom,
}: RulePackPickerProps) {
  const startsEmpty = pickedIds.length === 0 && pickedCustomIds.length === 0;
  return (
    <View style={sharedStyles.stack}>
      <Label>Rule packs</Label>
      <ErrorText>{error}</ErrorText>
      {packs?.map((pack) => (
        <RulePackOption
          key={pack.id}
          pack={pack}
          picked={pickedIds.includes(pack.id)}
          onToggle={() => onToggle(pack.id)}
        />
      ))}
      {customPacks && customPacks.length > 0 ? (
        <>
          <Label>Your packs</Label>
          {customPacks.map((pack) => (
            <RulePackOption
              key={pack.id}
              pack={pack}
              picked={pickedCustomIds.includes(pack.id)}
              onToggle={() => onToggleCustom(pack.id)}
            />
          ))}
        </>
      ) : null}
      {packs && startsEmpty ? <MutedText>Starting with no rules</MutedText> : null}
    </View>
  );
}

type PackOption = { id: string; name: string; rules: PackRule[] };

function RulePackOption({ pack, picked, onToggle }: { pack: PackOption; picked: boolean; onToggle: () => void }) {
  const [showRules, setShowRules] = useState(false);
  return (
    <View style={styles.option}>
      <PressableScale
        accessibilityRole="checkbox"
        accessibilityLabel={`Include ${pack.name}`}
        accessibilityState={{ checked: picked }}
        onPress={onToggle}
        feedback="tick"
        pressedScale={0.98}
        style={styles.pick}>
        <View style={[styles.box, picked && styles.boxPicked]}>
          {picked ? <Text style={styles.tick}>✓</Text> : null}
        </View>
        <Text style={styles.name}>{pack.name}</Text>
        <Text style={styles.count}>{pluralize(pack.rules.length, 'rule', 'rules')}</Text>
      </PressableScale>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${showRules ? 'Hide' : 'See'} the ${pack.name} rules`}
        onPress={() => setShowRules((shown) => !shown)}
        feedback="tick"
        hitSlop={8}
        style={styles.toggle}>
        <Text style={styles.toggleText}>{showRules ? 'Hide rules' : 'See rules'}</Text>
      </PressableScale>
      {showRules ? <PackRuleLines rules={pack.rules} /> : null}
    </View>
  );
}

const BOX = 22;

const styles = StyleSheet.create({
  option: { gap: Spacing.xs },
  pick: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 44 },
  box: {
    width: BOX,
    height: BOX,
    borderWidth: 2,
    borderColor: Paper.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxPicked: { backgroundColor: Paper.ink },
  tick: { fontFamily: Fonts.heavy, fontSize: 13, color: Paper.paper },
  name: { flex: 1, fontFamily: Fonts.bold, fontSize: 14, textTransform: 'uppercase', color: Paper.ink },
  count: { fontFamily: Fonts.regular, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: Paper.muted },
  toggle: { alignSelf: 'flex-start', marginLeft: BOX + Spacing.md },
  toggleText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.red,
  },
});
