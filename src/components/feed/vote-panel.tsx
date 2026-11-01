import { StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { VoteButtons } from '@/components/feed/vote-buttons';
import { VoteTallyDots } from '@/components/feed/vote-tally-dots';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Spacing } from '@/constants/theme';
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
  const approvalsLeft = votesNeeded - confirmedBy.length;

  return (
    <View style={styles.panel}>
      <DashedRule />
      {entry.status === 'pending' ? (
        <View style={sharedStyles.row}>
          <VoteTallyDots confirms={confirmedBy.length} votesNeeded={votesNeeded} />
          <MutedText>
            {confirmedBy.length} of {votesNeeded} approvals
            {rejectedBy.length > 0 ? ` · ${rejectedBy.length} declined` : ''}
          </MutedText>
        </View>
      ) : null}

      {confirmedBy.length > 0 ? <DetailLine label="Approved by" value={confirmedBy.join(', ')} /> : null}
      {rejectedBy.length > 0 ? <DetailLine label="Declined by" value={rejectedBy.join(', ')} /> : null}
      {entry.status === 'pending' && approvalsLeft > 0 ? (
        <DetailLine label="Needs" value={`${approvalsLeft} more`} />
      ) : null}

      {state.kind === 'can-vote' ? <VoteButtons entryId={entry.id} /> : null}
      {state.kind === 'voted' ? (
        <Text style={styles.myVote}>{state.confirmed ? 'You approved this' : 'You declined this'}</Text>
      ) : null}
      {state.kind === 'logged-it' || state.kind === 'about-me' ? (
        <MutedText>{SITTING_OUT_MESSAGES[state.kind]}</MutedText>
      ) : null}
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <LineItem label={label} labelStyle={styles.detailLabel} value={<Text style={styles.detailValue}>{value}</Text>} />
  );
}

const styles = StyleSheet.create({
  panel: { gap: Spacing.sm },
  detailLabel: { fontFamily: Fonts.regular, fontSize: 11.5, letterSpacing: 0.8, color: Colors.muted },
  detailValue: {
    flexShrink: 1,
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    textAlign: 'right',
    color: Colors.ink,
  },
  myVote: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: Colors.ink },
});
