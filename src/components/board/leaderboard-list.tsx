import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LeaderboardRow } from '@/api/leaderboard';
import { AnimatedListItem } from '@/components/animated-list-item';
import { Avatar } from '@/components/avatar';
import { MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts } from '@/constants/theme';
import { formatPoints, pointsColor } from '@/utils/format';

type LeaderboardListProps = {
  rows: LeaderboardRow[];
  myPlayerId: string;
  onPressPlayer: (playerId: string) => void;
};

export function LeaderboardList({ rows, myPlayerId, onPressPlayer }: LeaderboardListProps) {
  return (
    <View style={sharedStyles.list}>
      {rows.map((row) => {
        const isMe = row.player_id === myPlayerId;
        return (
          <AnimatedListItem key={row.player_id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`See ${row.name}'s entries`}
              onPress={() => onPressPlayer(row.player_id)}
              style={({ pressed }) => [sharedStyles.listRow, isMe && styles.myRow, pressed && styles.pressed]}>
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
              <Text style={[sharedStyles.pointsText, { color: pointsColor(row.points) }]}>
                {formatPoints(row.points)}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </AnimatedListItem>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  myRow: { backgroundColor: Colors.soft },
  pressed: { backgroundColor: Colors.line },
  rank: { fontFamily: Fonts.mono, fontSize: 15, fontWeight: '700', width: 20, color: Colors.muted },
  nameColumn: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  chevron: { fontSize: 20, color: Colors.muted },
});
