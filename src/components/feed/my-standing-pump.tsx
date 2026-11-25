import { tripQueries } from '@/api/trip-queries';
import { PumpDisplay } from '@/components/receipt/pump-display';
import { useCountUp } from '@/hooks/use-count-up';
import { useTripQuery } from '@/hooks/use-trip-query';
import { entriesStillNeedingMyVote } from '@/utils/voting';

// My total, what's waiting on my vote (the tab badge's number) and my rank, from queries the app already shares.
export function MyStandingPump({ myPlayerId }: { myPlayerId: string }) {
  const leaderboard = useTripQuery(tripQueries.leaderboard);
  const awaiting = useTripQuery(tripQueries.awaitingMyVote);
  const myRow = leaderboard.data?.find((row) => row.player_id === myPlayerId);
  const total = useCountUp(myRow?.points ?? 0);
  if (!myRow) return null;
  const pending = entriesStillNeedingMyVote(awaiting.data ?? [], myPlayerId).length;
  return (
    <PumpDisplay
      cells={[
        { label: 'Your total', value: total },
        { label: 'Pending', value: pending },
        { label: 'Rank', value: myRow.rank },
      ]}
    />
  );
}
