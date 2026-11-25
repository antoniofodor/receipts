import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { AddRuleCard } from '@/components/rules/add-rule-card';
import { Spacing } from '@/constants/theme';

// "Add a rule" opens the new-rule form in place of the buttons. Anyone can browse the rule packs.
export function RuleActions({ tripId }: { tripId: string }) {
  const [adding, setAdding] = useState(false);
  if (adding) return <AddRuleCard tripId={tripId} onClose={() => setAdding(false)} />;
  return (
    <View style={styles.row}>
      <View style={styles.slot}>
        <Button title="Add a rule" icon="add" variant="secondary" onPress={() => setAdding(true)} />
      </View>
      <View style={styles.slot}>
        <Button title="Rule packs" variant="secondary" onPress={() => router.push('/rule-packs')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  slot: { flex: 1 },
});
