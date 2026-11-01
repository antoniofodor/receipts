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
        <View style={styles.declineSlot}>
          <Button title="Decline" variant="secondary" onPress={() => vote(false)} disabled={busy} feedback="warning" />
        </View>
        <View style={styles.approveSlot}>
          <Button title="Approve" onPress={() => vote(true)} loading={busy} feedback="success" />
        </View>
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.xs },
  buttons: { flexDirection: 'row', gap: Spacing.sm },
  declineSlot: { flex: 1 },
  approveSlot: { flex: 1.4 },
});
