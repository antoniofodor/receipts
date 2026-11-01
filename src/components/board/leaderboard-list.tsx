import { StyleSheet, Text, View } from 'react-native';

import type { LeaderboardRow } from '@/api/leaderboard';
import { AnimatedListItem } from '@/components/animated-list-item';
import { Avatar } from '@/components/avatar';
import { CountUpPoints } from '@/components/count-up-points';
import { PressableScale } from '@/components/pressable-scale';
import { DottedLeader } from '@/components/receipt/dotted-leader';
import { Colors, Fonts, Radius, Spacing, Type } from '@/constants/theme';
import { pointsColor } from '@/utils/format';

type LeaderboardListProps = {
  rows: LeaderboardRow[];
  myPlayerId: string;
  onPressPlayer: (playerId: string) => void;
};

export function LeaderboardList({ rows, myPlayerId, onPressPlayer }: LeaderboardListProps) {
  return (
    <View>
      {rows.map((row, index) => (
        <AnimatedListItem key={row.player_id} index={index}>
          <LeaderboardLine row={row} isMe={row.player_id === myPlayerId} onPress={() => onPressPlayer(row.player_id)} />
        </AnimatedListItem>
      ))}
    </View>
  );
}

function LeaderboardLine({ row, isMe, onPress }: { row: LeaderboardRow; isMe: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`See ${row.name}'s entries`}
      onPress={onPress}
      pressedScale={0.98}
      style={[styles.row, isMe && styles.myRow]}>
      <Text style={[styles.rank, row.rank === 1 && styles.leader]}>{String(row.rank).padStart(2, '0')}</Text>
      <Avatar name={row.name} color={row.color} photoPath={row.photo_path} size={28} />
      <View style={styles.nameColumn}>
        <Text style={Type.name} numberOfLines={1}>
          {row.name}
          {row.is_groom ? ' ★' : ''}
          {isMe ? ' (you)' : ''}
        </Text>
        {row.pending_count > 0 ? <Text style={styles.pending}>{row.pending_count} pending</Text> : null}
      </View>
      <DottedLeader />
      <CountUpPoints points={row.points} style={[Type.points, styles.points, { color: pointsColor(row.points) }]} />
      <Text style={styles.chevron}>›</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  myRow: { backgroundColor: Colors.soft },
  rank: { width: 20, fontFamily: Fonts.bold, fontSize: 12, color: Colors.muted },
  leader: { color: Colors.red },
  nameColumn: { flexShrink: 1, gap: 1 },
  pending: {
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  points: { fontSize: 17 },
  chevron: { fontFamily: Fonts.regular, fontSize: 18, color: Colors.line },
});
