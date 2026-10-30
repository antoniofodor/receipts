import { getLeaderboard } from '@/api/leaderboard';
import { LeaderboardList } from '@/components/board/leaderboard-list';
import { Screen } from '@/components/screen';
import { ErrorText, Title } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export default function BoardScreen() {
  const membership = useMembership();
  const { data: rows, error, refreshing, refresh } = useTripQuery(getLeaderboard);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title subtitle="Confirmed points only. Pending entries count once they get their votes.">Leaderboard</Title>
      <ErrorText>{error}</ErrorText>
      {rows ? <LeaderboardList rows={rows} myPlayerId={membership.player_id} /> : null}
    </Screen>
  );
}
