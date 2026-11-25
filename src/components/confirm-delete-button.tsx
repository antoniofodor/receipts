import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '@/components/haptics';
import { ErrorText } from '@/components/typography';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';

type ConfirmDeleteButtonProps = {
  label: string;
  confirmTitle: string;
  confirmMessage: string;
  onConfirm: () => Promise<void>;
  confirmLabel?: string;
  busyLabel?: string;
};

// A small red action that asks first, then shows its own progress and any refusal underneath.
export function ConfirmDeleteButton({
  label,
  confirmTitle,
  confirmMessage,
  onConfirm,
  confirmLabel = 'Delete',
  busyLabel = 'Deleting…',
}: ConfirmDeleteButtonProps) {
  const { busy, error, run } = useAsyncAction();

  function confirmDelete() {
    haptics.warning();
    Alert.alert(confirmTitle, confirmMessage, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: () => run(onConfirm) },
    ]);
  }

  return (
    <View style={styles.stack}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ busy }}
        onPress={confirmDelete}
        disabled={busy}
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.text}>{busy ? busyLabel : label}</Text>
      </Pressable>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center', gap: Spacing.xs },
  button: { paddingVertical: Spacing.sm },
  pressed: { opacity: 0.5 },
  text: { fontFamily: Fonts.bold, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase', color: Paper.red },
});
