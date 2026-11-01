import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { VoteTallyDots } from '@/components/feed/vote-tally-dots';
import { Icon } from '@/components/icon';
import { ShareEntryButton } from '@/components/share/share-entry-button';
import { Colors, Fonts, Spacing } from '@/constants/theme';
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
      <View style={styles.start}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={entry.commentCount > 0 ? pluralize(entry.commentCount, 'comment', 'comments') : 'Comment'}
          onPress={onOpen}
          hitSlop={12}
          style={({ pressed }) => [styles.comments, pressed && styles.pressed]}>
          <Icon name="comment" color={Colors.muted} />
          {entry.commentCount > 0 ? <Text style={styles.count}>{entry.commentCount}</Text> : null}
        </Pressable>
        <ShareEntryButton entryId={entry.id} />
      </View>
      <View style={styles.end}>
        {entry.status === 'pending' ? (
          <VoteTallyDots confirms={confirmedBy.length} votesNeeded={votesNeeded} size="small" />
        ) : null}
        {state.kind === 'voted' ? (
          <Icon
            name={state.confirmed ? 'confirmed' : 'rejected'}
            color={state.confirmed ? Colors.ink : Colors.red}
            size={20}
            accessibilityLabel={state.confirmed ? 'You approved this' : 'You declined this'}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  start: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  comments: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  pressed: { opacity: 0.5 },
  count: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.muted },
  end: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
