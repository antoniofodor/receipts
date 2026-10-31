import { router } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { LeaderboardList } from '@/components/board/leaderboard-list';
import { Screen } from '@/components/screen';
import { ErrorText, Title } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export default function BoardScreen() {
  const membership = useMembership();
  const { data: rows, error, refreshing, refresh } = useTripQuery(tripQueries.leaderboard);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title subtitle="Confirmed points only. Pending entries count once they get their votes.">Leaderboard</Title>
      <ErrorText>{error}</ErrorText>
      {rows ? (
        <LeaderboardList
          rows={rows}
          myPlayerId={membership.player_id}
          onPressPlayer={(playerId) => router.push({ pathname: '/player/[id]', params: { id: playerId } })}
        />
      ) : null}
    </Screen>
  );
}
