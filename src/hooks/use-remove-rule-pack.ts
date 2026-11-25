import { removeCustomPackFromTrip } from '@/api/custom-packs';
import { removeRulePack } from '@/api/rule-packs';
import { tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { rulesFromPack, type PackRef } from '@/utils/rule-packs';

// The pack's rules leave the rulebook straight away, and come back if the server refuses.
// Entries already logged with them are untouched.
export function useRemoveRulePack() {
  const { trip_id: tripId } = useMembership();
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  return async (pack: PackRef) => {
    const undo = await updateOptimistically(tripQueries.rules, (rules) => {
      const removed = new Set(rulesFromPack(pack, rules));
      return rules.filter((rule) => !removed.has(rule));
    });
    try {
      if (pack.kind === 'preset') await removeRulePack(tripId, pack.id);
      else await removeCustomPackFromTrip(tripId, pack.id);
    } catch (caught) {
      undo();
      throw caught;
    }
    invalidate([tripQueries.rules]);
  };
}
