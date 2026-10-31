import { castVote, type Entry } from '@/api/entries';
import { tripQueries } from '@/api/trip-queries';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { withMyVote } from '@/utils/voting';

export function useVote(entryId: string) {
  const membership = useMembership();
  const { busy, error, run } = useAsyncAction();
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  function vote(confirm: boolean) {
    const me = { id: membership.player_id, name: membership.player_name };
    const applyMyVote = (entries: Entry[]) =>
      entries.map((entry) => (entry.id === entryId ? withMyVote(entry, me, confirm, membership.vote_threshold) : entry));

    run(async () => {
      const undos = await Promise.all([
        updateOptimistically(tripQueries.feed, applyMyVote),
        updateOptimistically(tripQueries.awaitingMyVote, applyMyVote),
        updateOptimistically(tripQueries.playerEntries, applyMyVote),
      ]);
      try {
        await castVote(entryId, confirm);
      } catch (caught) {
        for (const undo of undos) undo();
        throw caught;
      } finally {
        invalidate([tripQueries.feed, tripQueries.awaitingMyVote, tripQueries.playerEntries, tripQueries.leaderboard]);
      }
    });
  }

  return { vote, busy, error };
}
