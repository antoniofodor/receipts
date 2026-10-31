import { StyleSheet, Text, View } from 'react-native';

import type { Entry } from '@/api/entries';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { StatusPill } from '@/components/feed/status-pill';
import { VotePanel } from '@/components/feed/vote-panel';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';
import { formatRelativeTime } from '@/utils/relative-time';

type EntryCardProps = {
  entry: Entry;
  myPlayerId: string;
  votesNeeded: number;
};

export function EntryCard({ entry, myPlayerId, votesNeeded }: EntryCardProps) {
  const isSelfClaim = entry.filer.id === entry.subject.id;
  const byline = isSelfClaim ? `${entry.subject.name} (self-claim)` : `${entry.filer.name} → ${entry.subject.name}`;

  return (
    <Card>
      <View style={sharedStyles.row}>
        <Avatar name={entry.subject.name} color={entry.subject.color} size={32} />
        <View style={styles.byline}>
          <Text style={styles.names}>{byline}</Text>
          <MutedText>{formatRelativeTime(entry.created_at)}</MutedText>
        </View>
        <Text style={[styles.points, { color: pointsColor(entry.points) }]}>{formatPoints(entry.points)}</Text>
      </View>
      <Text style={styles.rule}>{entry.rule.title}</Text>
      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
      <StatusPill status={entry.status} />
      <VotePanel entry={entry} myPlayerId={myPlayerId} votesNeeded={votesNeeded} />
    </Card>
  );
}

const styles = StyleSheet.create({
  byline: { flex: 1 },
  names: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  points: { fontFamily: Fonts.mono, fontSize: 24, fontWeight: '800' },
  rule: { fontFamily: Fonts.mono, fontSize: 13, letterSpacing: 0.5, color: Colors.ink, textTransform: 'uppercase' },
  note: { fontSize: 15, color: Colors.ink, lineHeight: 21 },
});
