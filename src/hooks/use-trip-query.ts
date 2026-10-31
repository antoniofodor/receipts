import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { tripQueryKey, type TripQuery } from '@/api/trip-queries';
import { useMembership } from '@/session/session-provider';
import { errorMessage } from '@/utils/errors';

type TripQueryResult<T> = {
  data: T | null;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

export function useTripQuery<T>(query: TripQuery<T>): TripQueryResult<T>;
export function useTripQuery<T>(query: TripQuery<T, string>, param: string): TripQueryResult<T>;
export function useTripQuery<T>(query: TripQuery<T, string | void>, param?: string): TripQueryResult<T> {
  const { trip_id: tripId } = useMembership();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => tripQueryKey(query, tripId, param), [query, tripId, param]);
  const result = useQuery({ queryKey, queryFn: () => query.fetch(tripId, param) });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      queryClient.refetchQueries({ queryKey, stale: true });
    }, [queryClient, queryKey]),
  );

  async function refresh() {
    setRefreshing(true);
    await result.refetch();
    setRefreshing(false);
  }

  return {
    data: result.data ?? null,
    error: result.error ? errorMessage(result.error) : null,
    refreshing,
    refresh,
  };
}

export function useInvalidateTripQueries() {
  const { trip_id: tripId } = useMembership();
  const queryClient = useQueryClient();
  return (queries: TripQuery<unknown, never>[]) =>
    Promise.all(queries.map((query) => queryClient.invalidateQueries({ queryKey: tripQueryKey(query, tripId) })));
}

// Shows a write on screen before the server answers, in every cached copy of the query (all players, for
// player-scoped ones). Returns an undo for when the server refuses it.
export function useOptimisticTripUpdate() {
  const { trip_id: tripId } = useMembership();
  const queryClient = useQueryClient();
  return async <T,>(query: TripQuery<T, never>, update: (data: T) => T) => {
    const queryKey = tripQueryKey(query, tripId);
    // A refetch already in flight would land afterwards and wipe out the update.
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueriesData<T>({ queryKey });
    queryClient.setQueriesData<T>({ queryKey }, (data) => (data === undefined ? data : update(data)));
    return () => {
      for (const [key, data] of previous) queryClient.setQueryData(key, data);
    };
  };
}
