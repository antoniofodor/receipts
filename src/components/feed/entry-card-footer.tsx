import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { VoteTallyDots } from '@/components/feed/vote-tally-dots';
import { Icon } from '@/components/icon';
import { ShareEntryButton } from '@/components/share/share-entry-button';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import { pluralize } from '@/utils/format';
import { myVotingState, tallyVotes } from '@/utils/voting';

type EntryCardFooterProps = {
  entry: Entry;
  myPlayerId: string;
  votesNeeded: number;
  onOpen: () => void;
};

export function EntryCardFooter({ entry, myPlayerId, votesNeeded, onOpen }: EntryCardFooterProps) {
  const state = myVotingState(entry, myPlayerId);
  const { confirmedBy } = tallyVotes(entry.votes);

  return (
    <View style={styles.footer}>
      <View style={styles.tally}>
        {entry.status === 'pending' ? (
          <VoteTallyDots confirms={confirmedBy.length} votesNeeded={votesNeeded} size="small" showCount />
        ) : null}
        {state.kind === 'voted' ? (
          <Icon
            name={state.confirmed ? 'confirmed' : 'rejected'}
            color={state.confirmed ? Paper.ink : Paper.red}
            size={20}
            accessibilityLabel={state.confirmed ? 'You approved this' : 'You declined this'}
          />
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={entry.commentCount > 0 ? pluralize(entry.commentCount, 'comment', 'comments') : 'Comment'}
          onPress={onOpen}
          hitSlop={12}
          style={({ pressed }) => [styles.comments, pressed && styles.pressed]}>
          <Icon name="comment" color={Paper.muted} />
          {entry.commentCount > 0 ? <Text style={styles.count}>{entry.commentCount}</Text> : null}
        </Pressable>
        <ShareEntryButton entryId={entry.id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tally: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  comments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minWidth: 44,
    minHeight: 44,
  },
  pressed: { opacity: 0.5 },
  count: { fontFamily: Fonts.bold, fontSize: 12, color: Paper.muted },
});
