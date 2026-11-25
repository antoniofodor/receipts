import { updateRule } from '@/api/rules';
import { entryListQueries, tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';

// The rulebook shows the edit straight away and goes back if the server refuses. Entries show their rule's
// current name, so their lists refresh too; their points never change.
export function useUpdateRule() {
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  return async (ruleId: string, changes: { title: string; points: number }) => {
    const undo = await updateOptimistically(tripQueries.rules, (rules) =>
      rules.map((rule) => (rule.id === ruleId ? { ...rule, ...changes } : rule)),
    );
    try {
      await updateRule(ruleId, changes.title, changes.points);
    } catch (caught) {
      undo();
      throw caught;
    }
    invalidate([tripQueries.rules, ...entryListQueries, tripQueries.entry]);
  };
}
