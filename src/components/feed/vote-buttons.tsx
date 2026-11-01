import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ErrorText } from '@/components/typography';
import { Spacing } from '@/constants/theme';
import { useVote } from '@/hooks/use-vote';

export function VoteButtons({ entryId }: { entryId: string }) {
  const { vote, busy, error } = useVote(entryId);

  return (
    <View style={styles.stack}>
      <View style={styles.buttons}>
        <View style={styles.buttonSlot}>
          <Button title="Reject" variant="secondary" onPress={() => vote(false)} disabled={busy} />
        </View>
        <View style={styles.buttonSlot}>
          <Button title="Confirm" onPress={() => vote(true)} loading={busy} />
        </View>
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.xs },
  buttons: { flexDirection: 'row', gap: Spacing.sm },
  buttonSlot: { flex: 1 },
});
