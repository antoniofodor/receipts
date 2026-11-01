import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { EntryCardFooter } from '@/components/feed/entry-card-footer';
import { EntryPhotos } from '@/components/feed/entry-photos';
import { StatusPill } from '@/components/feed/status-pill';
import { VoteButtons } from '@/components/feed/vote-buttons';
import { VotePanel } from '@/components/feed/vote-panel';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';
import { formatRelativeTime } from '@/utils/relative-time';
import { myVotingState } from '@/utils/voting';

type EntryCardProps = {
  entry: Entry;
  myPlayerId: string;
  votesNeeded: number;
  // A list card stays compact and links to the entry screen, where the photos, votes and comments are shown in full.
  variant?: 'list' | 'detail';
};

export function EntryCard({ entry, myPlayerId, votesNeeded, variant = 'list' }: EntryCardProps) {
  const isSelfClaim = entry.filer.id === entry.subject.id;
  const byline = isSelfClaim ? `${entry.subject.name} (self-claim)` : `${entry.filer.name} → ${entry.subject.name}`;
  const openEntry = () => router.push({ pathname: '/entry/[id]', params: { id: entry.id } });
  const canVote = myVotingState(entry, myPlayerId).kind === 'can-vote';

  return (
    <Card>
      <View style={sharedStyles.row}>
        <Avatar name={entry.subject.name} color={entry.subject.color} size={32} />
        <View style={styles.byline}>
          <Text style={styles.names}>{byline}</Text>
          <View style={styles.meta}>
            <MutedText>{formatRelativeTime(entry.created_at)}</MutedText>
            <StatusPill status={entry.status} />
          </View>
        </View>
        <Text style={[styles.points, { color: pointsColor(entry.points) }]}>{formatPoints(entry.points)}</Text>
      </View>
      <Text style={styles.rule}>{entry.rule.title}</Text>
      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
      {variant === 'list' ? (
        <>
          <EntryPhotos photos={entry.photos} layout="strip" onPress={openEntry} />
          {canVote ? <VoteButtons entryId={entry.id} /> : null}
          <EntryCardFooter entry={entry} myPlayerId={myPlayerId} votesNeeded={votesNeeded} onOpen={openEntry} />
        </>
      ) : (
        <VotePanel entry={entry} myPlayerId={myPlayerId} votesNeeded={votesNeeded} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  byline: { flex: 1, gap: 2 },
  names: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  points: { fontFamily: Fonts.mono, fontSize: 24, fontWeight: '800' },
  rule: { fontFamily: Fonts.mono, fontSize: 13, letterSpacing: 0.5, color: Colors.ink, textTransform: 'uppercase' },
  note: { fontSize: 15, color: Colors.ink, lineHeight: 21 },
});
