import { deleteRule } from '@/api/rules';
import { tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';

// The rule leaves the rulebook straight away, and comes back if the server refuses.
// Entries already logged with it are untouched.
export function useDeleteRule() {
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  return async (ruleId: string) => {
    const undo = await updateOptimistically(tripQueries.rules, (rules) => rules.filter((rule) => rule.id !== ruleId));
    try {
      await deleteRule(ruleId);
    } catch (caught) {
      undo();
      throw caught;
    }
    invalidate([tripQueries.rules]);
  };
}
