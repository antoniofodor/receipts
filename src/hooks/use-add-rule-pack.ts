import { addCustomPackToTrip } from '@/api/custom-packs';
import { addRulePack } from '@/api/rule-packs';
import type { Rule } from '@/api/rules';
import { tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { rulesMissingFromTrip, type PackRef } from '@/utils/rule-packs';

// The pack's missing rules join the rulebook straight away, and leave again if the server refuses.
export function useAddRulePack() {
  const { trip_id: tripId } = useMembership();
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  return async (pack: PackRef) => {
    const createdAt = new Date().toISOString();
    const withPack = (rules: Rule[]) => [
      ...rules,
      ...rulesMissingFromTrip(pack, rules).map((rule) => ({
        ...rule,
        id: `${pack.id}:${rule.title}`,
        is_preset: true,
        created_by: null,
        created_at: createdAt,
        pack_id: pack.kind === 'preset' ? pack.id : null,
        custom_pack_id: pack.kind === 'custom' ? pack.id : null,
      })),
    ];
    const undo = await updateOptimistically(tripQueries.rules, withPack);
    try {
      if (pack.kind === 'preset') await addRulePack(tripId, pack.id);
      else await addCustomPackToTrip(tripId, pack.id);
    } catch (caught) {
      undo();
      throw caught;
    }
    invalidate([tripQueries.rules]);
  };
}
