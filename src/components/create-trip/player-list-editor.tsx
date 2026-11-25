import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PressableScale } from '@/components/pressable-scale';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { DottedUnderline } from '@/components/receipt/dotted-underline';
import { TextField } from '@/components/text-fields';
import { PLAYER_NAME_MAX_LENGTH } from '@/constants/game-rules';
import { Fonts, Paper, Spacing } from '@/constants/theme';

export const ORGANISER_ROW_ID = 'organiser';

export type PlayerRow = { id: string; name: string };

type PlayerListEditorProps = {
  rows: PlayerRow[];
  groomRowId: string | null;
  onRename: (rowId: string, name: string) => void;
  onRemove: (rowId: string) => void;
  onAdd: () => void;
  onToggleGroom: (rowId: string) => void;
};

// Who's in, as one receipt: a numbered line per player, written on a dotted blank.
export function PlayerListEditor({
  rows,
  groomRowId,
  onRename,
  onRemove,
  onAdd,
  onToggleGroom,
}: PlayerListEditorProps) {
  return (
    <Card seed="new-trip-players">
      {rows.map((row, position) => {
        const isOrganiser = row.id === ORGANISER_ROW_ID;
        const fieldLabel = isOrganiser ? 'Your name' : `Player ${position + 1}`;
        const isGroom = groomRowId === row.id;
        return (
          <View key={row.id} style={styles.line}>
            {position > 0 ? <DashedRule /> : null}
            <View style={styles.row}>
              <Text style={styles.number}>{String(position + 1).padStart(2, '0')}</Text>
              <View style={styles.nameColumn}>
                <TextField
                  value={row.name}
                  onChangeText={(name) => onRename(row.id, name)}
                  placeholder={fieldLabel}
                  maxLength={PLAYER_NAME_MAX_LENGTH}
                  style={styles.nameField}
                  accessibilityLabel={fieldLabel}
                />
                <DottedUnderline />
                {isOrganiser ? <Text style={styles.youTag}>Organiser · You</Text> : null}
              </View>
              <PressableScale
                accessibilityRole="checkbox"
                accessibilityLabel="Groom"
                accessibilityState={{ checked: isGroom }}
                onPress={() => onToggleGroom(row.id)}
                feedback="tick"
                style={styles.star}>
                <Text style={[styles.starText, isGroom && styles.starOn]}>{isGroom ? '★' : '☆'}</Text>
              </PressableScale>
              {isOrganiser ? (
                <View style={styles.removeSlot} />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${row.name || fieldLabel}`}
                  onPress={() => onRemove(row.id)}
                  hitSlop={4}
                  style={styles.removeSlot}>
                  <Text style={styles.removeText}>{'×'}</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
      <Button title="Add player" variant="secondary" onPress={onAdd} />
    </Card>
  );
}

const styles = StyleSheet.create({
  line: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  number: { width: 22, fontFamily: Fonts.heavy, fontSize: 12, color: Paper.muted },
  nameColumn: { flex: 1, gap: 2 },
  nameField: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: Spacing.xs,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  youTag: {
    fontFamily: Fonts.heavy,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Paper.red,
    paddingTop: 2,
  },
  star: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  starText: { fontFamily: Fonts.regular, fontSize: 24, color: Paper.muted },
  starOn: { color: Paper.red },
  removeSlot: { width: 28, height: 44, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: Fonts.regular, fontSize: 24, color: Paper.muted },
});
