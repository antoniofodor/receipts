import { router } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { BoardReceipt } from '@/components/board/board-receipt';
import { LeaderboardList } from '@/components/board/leaderboard-list';
import { PriceSign } from '@/components/board/price-sign';
import { PumpDisplay } from '@/components/receipt/pump-display';
import { Screen } from '@/components/screen';
import { SignTitle } from '@/components/ground/sign-title';
import { ErrorText } from '@/components/typography';
import { useCountUp } from '@/hooks/use-count-up';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { pluralize } from '@/utils/format';

export default function BoardScreen() {
  const membership = useMembership();
  const { data: rows, error, refreshing, refresh } = useTripQuery(tripQueries.leaderboard);
  const myRow = rows?.find((row) => row.player_id === membership.player_id);
  const myPoints = useCountUp(myRow?.points ?? 0);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <SignTitle eyebrow={rows ? pluralize(rows.length, 'player', 'players') : undefined}>Board</SignTitle>
      <ErrorText>{error}</ErrorText>
      {rows ? (
        <>
          <PriceSign rows={rows} />
          {myRow ? <PumpDisplay cells={[{ label: `You · #${myRow.rank} · pts`, value: myPoints }]} /> : null}
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
