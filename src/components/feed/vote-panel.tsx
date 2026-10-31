import { StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { Button } from '@/components/button';
import { ErrorText, MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useVote } from '@/hooks/use-vote';
import { myVotingState, tallyVotes } from '@/utils/voting';

type VotePanelProps = {
  entry: Entry;
  myPlayerId: string;
  votesNeeded: number;
};

const SITTING_OUT_MESSAGES: Record<'logged-it' | 'about-me', string> = {
  'logged-it': 'You logged this. The others decide.',
  'about-me': "This one's about you. The others decide.",
};

export function VotePanel({ entry, myPlayerId, votesNeeded }: VotePanelProps) {
  const { vote, busy, error } = useVote(entry.id);
  const state = myVotingState(entry, myPlayerId);
  const { confirmedBy, rejectedBy } = tallyVotes(entry.votes);

  return (
    <View style={styles.panel}>
      {entry.status === 'pending' ? (
        <View style={sharedStyles.row} accessibilityLabel={`${confirmedBy.length} of ${votesNeeded} confirms`}>
          {Array.from({ length: votesNeeded }, (_, index) => (
            <View key={index} style={[styles.dot, index < confirmedBy.length && styles.dotFilled]} />
          ))}
          <MutedText>
            {confirmedBy.length} of {votesNeeded} confirms
            {rejectedBy.length > 0 ? ` · ${rejectedBy.length} of ${votesNeeded} rejects` : ''}
          </MutedText>
        </View>
      ) : null}

      {confirmedBy.length > 0 ? <MutedText>Confirmed by {confirmedBy.join(', ')}</MutedText> : null}
      {rejectedBy.length > 0 ? <MutedText>Rejected by {rejectedBy.join(', ')}</MutedText> : null}

      {state.kind === 'can-vote' ? (
        <View style={styles.buttons}>
          <View style={styles.buttonSlot}>
            <Button title="Reject" variant="secondary" onPress={() => vote(false)} disabled={busy} />
          </View>
          <View style={styles.buttonSlot}>
            <Button title="Confirm" onPress={() => vote(true)} loading={busy} />
          </View>
        </View>
      ) : null}
      {state.kind === 'voted' ? (
        <Text style={styles.myVote}>{state.confirmed ? 'You confirmed this' : 'You rejected this'}</Text>
      ) : null}
      {state.kind === 'logged-it' || state.kind === 'about-me' ? (
        <MutedText>{SITTING_OUT_MESSAGES[state.kind]}</MutedText>
      ) : null}
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
    paddingTop: Spacing.md,
  },
  dot: { width: 18, height: 8, borderRadius: Radius.pill, backgroundColor: Colors.line },
  dotFilled: { backgroundColor: Colors.plus },
  buttons: { flexDirection: 'row', gap: Spacing.sm },
  buttonSlot: { flex: 1 },
  myVote: { fontSize: 14, fontWeight: '700', color: Colors.ink },
});
