import { deleteEntry, type Entry } from '@/api/entries';
import { entryListQueries, tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';

// The entry leaves every list straight away, and comes back if the server refuses.
export function useDeleteEntry() {
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  return async (entryId: string) => {
    const withoutIt = (entries: Entry[]) => entries.filter((entry) => entry.id !== entryId);
    const undos = await Promise.all(entryListQueries.map((query) => updateOptimistically(query, withoutIt)));
    try {
      await deleteEntry(entryId);
    } catch (caught) {
      for (const undo of undos) undo();
      throw caught;
    }
    invalidate([...entryListQueries, tripQueries.leaderboard]);
  };
}
