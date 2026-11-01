import { router } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { BoardReceipt } from '@/components/board/board-receipt';
import { LeaderboardList } from '@/components/board/leaderboard-list';
import { PumpDisplay } from '@/components/receipt/pump-display';
import { Screen } from '@/components/screen';
import { ErrorText, Title } from '@/components/typography';
import { useCountUp } from '@/hooks/use-count-up';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { formatPoints, pluralize } from '@/utils/format';

export default function BoardScreen() {
  const membership = useMembership();
  const { data: rows, error, refreshing, refresh } = useTripQuery(tripQueries.leaderboard);
  const myRow = rows?.find((row) => row.player_id === membership.player_id);
  const myPoints = useCountUp(myRow?.points ?? 0);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title eyebrow={rows ? pluralize(rows.length, 'player', 'players') : undefined}>Board</Title>
      <ErrorText>{error}</ErrorText>
      {rows ? (
        <>
          {myRow ? (
            <PumpDisplay label={`You · #${myRow.rank}`} value={formatPoints(myPoints)} negative={myPoints < 0} />
          ) : null}
          <BoardReceipt
            tripId={membership.trip_id}
            tripName={membership.trip_name}
            joinCode={membership.join_code}
            printedAt={new Date()}>
            <LeaderboardList
              rows={rows}
              myPlayerId={membership.player_id}
              onPressPlayer={(playerId) => router.push({ pathname: '/player/[id]', params: { id: playerId } })}
            />
          </BoardReceipt>
        </>
      ) : null}
    </Screen>
  );
}
