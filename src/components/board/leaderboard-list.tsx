import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardRow } from '@/api/leaderboard';
import { Avatar } from '@/components/avatar';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

export function LeaderboardList({ rows, myPlayerId }: { rows: LeaderboardRow[]; myPlayerId: string }) {
  return (
    <View style={sharedStyles.list}>
      {rows.map((row) => {
        const isMe = row.player_id === myPlayerId;
        return (
          <View key={row.player_id} style={[sharedStyles.listRow, isMe && styles.myRow]}>
            <Text style={styles.rank}>{row.rank}</Text>
            <Avatar name={row.name} color={row.color} size={32} />
            <View style={styles.nameColumn}>
              <Text style={styles.name}>
                {row.name}
                {row.is_groom ? '  ★' : ''}
                {isMe ? '  (you)' : ''}
              </Text>
              {row.pending_count > 0 ? <MutedText>{row.pending_count} pending</MutedText> : null}
            </View>
            <Text style={[sharedStyles.pointsText, { color: pointsColor(row.points) }]}>{formatPoints(row.points)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  myRow: { backgroundColor: Colors.soft },
  rank: { fontFamily: Fonts.mono, fontSize: 15, fontWeight: '700', width: 20, color: Colors.muted },
  nameColumn: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.ink },
});
