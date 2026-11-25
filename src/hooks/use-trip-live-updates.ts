import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';

import { subscribeToTripChanges } from '@/api/realtime';
import { liveQueries, liveTables, queriesRefreshedBy, tripQueryKey, type TripQuery } from '@/api/trip-queries';
import { useMembership, useSession } from '@/session/session-provider';

export function useTripLiveUpdates() {
  const { trip_id: tripId } = useMembership();
  const { reloadMembership } = useSession();
  const queryClient = useQueryClient();
  // Another phone signed in as the same player may have renamed it. A failed reload only leaves the old name
  // showing until the next change or reconnect.
  const refreshMyName = useEffectEvent(() => {
    reloadMembership().catch(() => {});
  });

  useEffect(() => {
    const refresh = (queries: TripQuery<unknown>[]) => {
      for (const query of queries) queryClient.invalidateQueries({ queryKey: tripQueryKey(query, tripId) });
    };
    return subscribeToTripChanges(tripId, liveTables, {
      onChange: (table) => {
        refresh(queriesRefreshedBy(table));
        if (table === 'players') refreshMyName();
      },
      onLive: () => {
        refresh(liveQueries);
        refreshMyName();
      },
    });
  }, [tripId, queryClient]);
}
