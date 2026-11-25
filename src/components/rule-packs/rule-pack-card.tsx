import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { PackRule } from '@/api/rule-packs';
import { Card } from '@/components/card';
import { PressableScale } from '@/components/pressable-scale';
import { LineItem } from '@/components/receipt/line-item';
import { PackRuleLines } from '@/components/rule-packs/pack-rule-lines';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Type } from '@/constants/theme';
import { pluralize } from '@/utils/format';

type RulePackCardProps = {
  pack: { id: string; name: string; rules: PackRule[] };
  action: ReactNode;
};

export function RulePackCard({ pack, action }: RulePackCardProps) {
  const [showRules, setShowRules] = useState(false);
  return (
    <Card seed={pack.id}>
      <LineItem
        label={pack.name}
        labelStyle={styles.packName}
        value={<Text style={Type.label}>{pluralize(pack.rules.length, 'rule', 'rules')}</Text>}
      />
      {showRules ? <PackRuleLines rules={pack.rules} /> : null}
      <View style={[sharedStyles.row, styles.footer]}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`${showRules ? 'Hide' : 'See'} the ${pack.name} rules`}
          onPress={() => setShowRules((shown) => !shown)}
          feedback="tick"
          hitSlop={8}>
          <Text style={styles.toggle}>{showRules ? 'Hide rules' : 'See rules'}</Text>
        </PressableScale>
      </View>
      {action}
    </Card>
  );
}

const styles = StyleSheet.create({
  packName: { ...Type.name, fontSize: 20, lineHeight: 22 },
  footer: { justifyContent: 'flex-end' },
  toggle: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Paper.red },
});
