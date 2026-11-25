import { StyleSheet, Text, View } from 'react-native';

import type { NewPackRule } from '@/api/custom-packs';
import { PressableScale } from '@/components/pressable-scale';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { screenReaderSwipeActions, SwipeableRow } from '@/components/swipeable-row';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import type { RuleSelection } from '@/hooks/use-rule-selection';
import { formatPoints, pointsColor } from '@/utils/format';

type RuleChecklistProps = {
  rules: NewPackRule[];
  selection: RuleSelection;
  // Rules the pack already has can't be picked again.
  alreadyIn: (rule: NewPackRule) => boolean;
  onAdd: (rule: NewPackRule) => void;
};

// Tick boxes beside rule lines, for picking rules to copy into a pack. Swiping a line right adds it at once.
export function RuleChecklist({ rules, selection, alreadyIn, onAdd }: RuleChecklistProps) {
  return (
    <View>
      {rules.map((rule, index) => (
        <View key={rule.title}>
          {index > 0 ? <DashedRule /> : null}
          <ChecklistLine rule={rule} selection={selection} inPack={alreadyIn(rule)} onAdd={() => onAdd(rule)} />
        </View>
      ))}
    </View>
  );
}

type ChecklistLineProps = {
  rule: NewPackRule;
  selection: RuleSelection;
  inPack: boolean;
  onAdd: () => void;
};

function ChecklistLine({ rule, selection, inPack, onAdd }: ChecklistLineProps) {
  const picked = inPack || selection.isPicked(rule);
  const swipe = inPack ? {} : ({ swipeRight: { label: 'Add', tone: 'add', onAction: onAdd } } as const);
  return (
    <SwipeableRow {...swipe}>
      <PressableScale
        accessibilityRole="checkbox"
        accessibilityLabel={`${rule.title}, ${formatPoints(rule.points)}`}
        accessibilityState={{ checked: picked, disabled: inPack }}
        {...screenReaderSwipeActions(swipe)}
        disabled={inPack}
        onPress={() => selection.toggle(rule)}
        feedback="tick"
        pressedScale={0.98}
        style={[styles.row, inPack && styles.inPack]}>
        <View style={[styles.box, picked && styles.boxPicked]}>
          {picked ? <Text style={styles.tick}>✓</Text> : null}
        </View>
        <View style={styles.line}>
          <LineItem
            label={rule.title}
            value={
              <Text style={[sharedStyles.pointsText, { color: pointsColor(rule.points) }]}>
                {formatPoints(rule.points)}
              </Text>
            }
          />
          {inPack ? <Text style={styles.inPackTag}>In pack</Text> : null}
        </View>
      </PressableScale>
    </SwipeableRow>
  );
}

const BOX = 20;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 44, paddingVertical: Spacing.xs },
  inPack: { opacity: 0.55 },
  box: {
    width: BOX,
    height: BOX,
    borderWidth: 2,
    borderColor: Paper.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxPicked: { backgroundColor: Paper.ink },
  tick: { fontFamily: Fonts.heavy, fontSize: 12, color: Paper.paper },
  line: { flex: 1, gap: 2 },
  inPackTag: {
    fontFamily: Fonts.heavy,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.muted,
  },
});
