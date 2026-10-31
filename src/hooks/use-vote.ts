import { castVote, type Entry } from '@/api/entries';
import { entryListQueries, tripQueries } from '@/api/trip-queries';
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
    const applyMyVote = (entry: Entry) =>
      entry.id === entryId ? withMyVote(entry, me, confirm, membership.vote_threshold) : entry;

    run(async () => {
      const undos = await Promise.all([
        ...entryListQueries.map((query) => updateOptimistically(query, (entries) => entries.map(applyMyVote))),
        updateOptimistically(tripQueries.entry, (entry) => entry && applyMyVote(entry)),
      ]);
      try {
        await castVote(entryId, confirm);
      } catch (caught) {
        for (const undo of undos) undo();
        throw caught;
      } finally {
        invalidate([...entryListQueries, tripQueries.entry, tripQueries.leaderboard]);
      }
    });
  }

  return { vote, busy, error };
}
