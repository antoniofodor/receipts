import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { TextField } from '@/components/text-fields';
import { Label } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Spacing } from '@/constants/theme';

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

export function PlayerListEditor({
  rows,
  groomRowId,
  onRename,
  onRemove,
  onAdd,
  onToggleGroom,
}: PlayerListEditorProps) {
  return (
    <View style={sharedStyles.stack}>
      <Label>Players</Label>
      {rows.map((row, position) => {
        const isOrganiser = row.id === ORGANISER_ROW_ID;
        const fieldLabel = isOrganiser ? 'Your name' : `Player ${position + 1}`;
        return (
          <Card key={row.id} style={styles.card}>
            <View style={sharedStyles.row}>
              <TextField
                value={row.name}
                onChangeText={(name) => onRename(row.id, name)}
                placeholder={fieldLabel}
                maxLength={30}
                style={styles.nameField}
                accessibilityLabel={fieldLabel}
              />
              {isOrganiser ? null : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${row.name || fieldLabel}`}
                  onPress={() => onRemove(row.id)}
                  hitSlop={8}
                  style={styles.remove}>
                  <Text style={styles.removeText}>{'×'}</Text>
                </Pressable>
              )}
            </View>
            <View style={sharedStyles.row}>
              {isOrganiser ? <Text style={styles.youTag}>YOU · ORGANISER</Text> : null}
              <Chip label={'★ Groom'} selected={groomRowId === row.id} onPress={() => onToggleGroom(row.id)} />
            </View>
          </Card>
        );
      })}
      <Button title="Add player" variant="secondary" onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.md, gap: Spacing.sm },
  nameField: { flex: 1 },
  remove: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: Fonts.regular, fontSize: 24, color: Colors.muted },
  youTag: { fontFamily: Fonts.bold, fontSize: 10.5, color: Colors.red, letterSpacing: 1.4, flex: 1 },
});
