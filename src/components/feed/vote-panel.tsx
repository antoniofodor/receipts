import { StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { VoteButtons } from '@/components/feed/vote-buttons';
import { VoteTallyDots } from '@/components/feed/vote-tally-dots';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Spacing } from '@/constants/theme';
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

// The full voting story, for the entry screen. Cards in lists show the compact EntryCardFooter instead.
export function VotePanel({ entry, myPlayerId, votesNeeded }: VotePanelProps) {
  const state = myVotingState(entry, myPlayerId);
  const { confirmedBy, rejectedBy } = tallyVotes(entry.votes);

  return (
    <View style={styles.panel}>
      {entry.status === 'pending' ? (
        <View style={sharedStyles.row}>
          <VoteTallyDots confirms={confirmedBy.length} votesNeeded={votesNeeded} />
          <MutedText>
            {confirmedBy.length} of {votesNeeded} confirms
            {rejectedBy.length > 0 ? ` · ${rejectedBy.length} of ${votesNeeded} rejects` : ''}
          </MutedText>
        </View>
      ) : null}

      {confirmedBy.length > 0 ? <MutedText>Confirmed by {confirmedBy.join(', ')}</MutedText> : null}
      {rejectedBy.length > 0 ? <MutedText>Rejected by {rejectedBy.join(', ')}</MutedText> : null}

      {state.kind === 'can-vote' ? <VoteButtons entryId={entry.id} /> : null}
      {state.kind === 'voted' ? (
        <Text style={styles.myVote}>{state.confirmed ? 'You confirmed this' : 'You rejected this'}</Text>
      ) : null}
      {state.kind === 'logged-it' || state.kind === 'about-me' ? (
        <MutedText>{SITTING_OUT_MESSAGES[state.kind]}</MutedText>
      ) : null}
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
  myVote: { fontSize: 14, fontWeight: '700', color: Colors.ink },
});
