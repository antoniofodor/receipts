import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToTripChanges } from '@/api/realtime';
import { liveQueries, liveTables, queriesRefreshedBy, tripQueryKey, type TripQuery } from '@/api/trip-queries';
import { useMembership } from '@/session/session-provider';

export function useTripLiveUpdates() {
  const { trip_id: tripId } = useMembership();
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = (queries: TripQuery<unknown>[]) => {
      for (const query of queries) queryClient.invalidateQueries({ queryKey: tripQueryKey(query, tripId) });
    };
    return subscribeToTripChanges(tripId, liveTables, {
      onChange: (table) => refresh(queriesRefreshedBy(table)),
      onLive: () => refresh(liveQueries),
    });
  }, [tripId, queryClient]);
}
