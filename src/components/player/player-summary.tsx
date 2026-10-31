import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardRow } from '@/api/leaderboard';
import { Avatar } from '@/components/avatar';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

export function PlayerSummary({ row, isMe }: { row: LeaderboardRow; isMe: boolean }) {
  const standing = row.pending_count > 0 ? `#${row.rank} · ${row.pending_count} pending` : `#${row.rank}`;
  return (
    <View style={[sharedStyles.row, styles.summary]}>
      <Avatar name={row.name} color={row.color} size={56} />
      <View style={styles.nameColumn}>
        <Text style={styles.name}>{row.name}</Text>
        {row.is_groom || isMe ? (
          <MutedText>{[row.is_groom && '★ Groom', isMe && 'You'].filter(Boolean).join(' · ')}</MutedText>
        ) : null}
        <MutedText>{standing}</MutedText>
      </View>
      <Text style={[styles.points, { color: pointsColor(row.points) }]}>{formatPoints(row.points)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { gap: Spacing.md },
  nameColumn: { flex: 1, gap: 2 },
  name: { fontSize: 26, fontWeight: '800', color: Colors.ink },
  points: { fontFamily: Fonts.mono, fontSize: 28, fontWeight: '800' },
});
