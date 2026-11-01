import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { EntryCardFooter } from '@/components/feed/entry-card-footer';
import { EntryPhotos } from '@/components/feed/entry-photos';
import { FiledByBadge } from '@/components/feed/filed-by-badge';
import { StatusPill } from '@/components/feed/status-pill';
import { VoteButtons } from '@/components/feed/vote-buttons';
import { VotePanel } from '@/components/feed/vote-panel';
import { Barcode } from '@/components/receipt/barcode';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { Stamp } from '@/components/receipt/stamp';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Spacing, Type } from '@/constants/theme';
import { useSettledWhileWatching } from '@/hooks/use-settled-while-watching';
import { formatPoints, formatReceiptNumber, pointsColor } from '@/utils/format';
import { STATUS_LABELS } from '@/utils/entry-status';
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
  const openEntry = () => router.push({ pathname: '/entry/[id]', params: { id: entry.id } });
  const canVote = myVotingState(entry, myPlayerId).kind === 'can-vote';
  const settled = useSettledWhileWatching(entry.status);

  return (
    <Card>
      <View style={styles.receiptHeader}>
        <Text style={styles.small}>TXN {formatReceiptNumber(entry.id)}</Text>
        <Text style={styles.small}>{formatRelativeTime(entry.created_at)}</Text>
      </View>
      <View style={sharedStyles.row}>
        <Avatar name={entry.subject.name} color={entry.subject.color} photoPath={entry.subject.photo_path} />
        <View style={styles.byline}>
          <Text style={[Type.name, styles.subject]}>{entry.subject.name}</Text>
          <View style={styles.badges}>
            <StatusPill status={entry.status} />
            <FiledByBadge filer={entry.filer} isSelfClaim={isSelfClaim} />
          </View>
        </View>
      </View>
      <DashedRule />
      <LineItem
        label={entry.rule.title}
        value={
          <Text
            style={[Type.points, { color: pointsColor(entry.points) }, entry.status === 'rejected' && styles.struck]}>
            {formatPoints(entry.points)}
          </Text>
        }
      />
      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
      {variant === 'list' ? (
        <>
          <EntryPhotos photos={entry.photos} layout="strip" onPress={openEntry} />
          {canVote ? <VoteButtons entryId={entry.id} /> : null}
          <EntryCardFooter entry={entry} myPlayerId={myPlayerId} votesNeeded={votesNeeded} onOpen={openEntry} />
        </>
      ) : (
        <>
          <VotePanel entry={entry} myPlayerId={myPlayerId} votesNeeded={votesNeeded} />
          <Barcode seed={entry.id} />
        </>
      )}
      {settled ? <Stamp label={STATUS_LABELS[settled].toUpperCase()} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  small: {
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  byline: { flex: 1, gap: Spacing.xs },
  subject: { fontSize: 15 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  struck: { color: Colors.muted, textDecorationLine: 'line-through' },
  note: { ...Type.body, color: Colors.ink, opacity: 0.8 },
});
