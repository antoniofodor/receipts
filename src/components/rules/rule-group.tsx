import { StyleSheet, Text, View } from 'react-native';

import type { Rule } from '@/api/rules';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

export function RuleGroup({ title, rules }: { title: string; rules: Rule[] }) {
  if (rules.length === 0) return null;
  return (
    <View style={sharedStyles.stack}>
      <Label>
        {title} · {rules.length}
      </Label>
      <View style={sharedStyles.list}>
        {rules.map((rule) => (
          <View key={rule.id} style={sharedStyles.listRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.title}>{rule.title}</Text>
              {rule.is_preset ? null : <Text style={styles.addedTag}>ADDED ON THE TRIP</Text>}
            </View>
            <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>{formatPoints(rule.points)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleColumn: { flex: 1 },
  title: { fontSize: 15, color: Colors.ink },
  addedTag: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 1, color: Colors.accent, marginTop: 2 },
});
