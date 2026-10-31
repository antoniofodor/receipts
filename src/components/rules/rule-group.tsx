import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Rule } from '@/api/rules';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

type RuleGroupProps = {
  title: string;
  rules: Rule[];
  onPressRule: (rule: Rule) => void;
};

export function RuleGroup({ title, rules, onPressRule }: RuleGroupProps) {
  if (rules.length === 0) return null;
  return (
    <View style={sharedStyles.stack}>
      <Label>
        {title} · {rules.length}
      </Label>
      <View style={sharedStyles.list}>
        {rules.map((rule) => (
          <Pressable
            key={rule.id}
            accessibilityRole="button"
            accessibilityLabel={`Log ${rule.title}, ${formatPoints(rule.points)}`}
            onPress={() => onPressRule(rule)}
            style={({ pressed }) => [sharedStyles.listRow, pressed && styles.pressed]}>
            <View style={styles.titleColumn}>
              <Text style={styles.title}>{rule.title}</Text>
              {rule.is_preset ? null : <Text style={styles.addedTag}>ADDED ON THE TRIP</Text>}
            </View>
            <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>{formatPoints(rule.points)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { backgroundColor: Colors.soft },
  titleColumn: { flex: 1 },
  title: { fontSize: 15, color: Colors.ink },
  addedTag: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 1, color: Colors.accent, marginTop: 2 },
});
