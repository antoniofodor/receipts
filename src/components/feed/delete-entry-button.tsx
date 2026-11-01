import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/components/haptics';
import { ErrorText } from '@/components/typography';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useDeleteEntry } from '@/hooks/use-delete-entry';

type DeleteEntryButtonProps = {
  entryId: string;
  onDeleted: () => void;
};

export function DeleteEntryButton({ entryId, onDeleted }: DeleteEntryButtonProps) {
  const deleteEntry = useDeleteEntry();
  const { busy, error, run } = useAsyncAction();

  function confirmDelete() {
    haptics.warning();
    Alert.alert('Delete this entry?', 'It disappears for everyone, along with its photos, votes and comments.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          run(async () => {
            await deleteEntry(entryId);
            onDeleted();
          }),
      },
    ]);
  }

  return (
    <View style={styles.stack}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete entry"
        accessibilityState={{ busy }}
        onPress={confirmDelete}
        disabled={busy}
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.text}>{busy ? 'Deleting…' : 'Delete entry'}</Text>
      </Pressable>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center', gap: Spacing.xs },
  button: { paddingVertical: Spacing.sm },
  pressed: { opacity: 0.5 },
  text: { fontFamily: Fonts.bold, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase', color: Colors.red },
});
