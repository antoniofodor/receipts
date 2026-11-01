import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { tripQueryKey, type TripQuery } from '@/api/trip-queries';
import { useMembership } from '@/session/session-provider';
import { errorMessage } from '@/utils/errors';

type TripQueryResult<T> = {
  data: T | null;
  loading: boolean;
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
    loading: result.isPending,
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

// Shows a write on screen before the server answers. Without a param it updates every cached copy of the query
// (each player's entries, say); with one, only that copy. Returns an undo for when the server refuses it.
export function useOptimisticTripUpdate() {
  const { trip_id: tripId } = useMembership();
  const queryClient = useQueryClient();
  return async <T>(query: TripQuery<T, never>, update: (data: T) => T, param?: string) => {
    const queryKey = tripQueryKey(query, tripId, param);
    // A refetch already in flight would land afterwards and wipe out the update.
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueriesData<T>({ queryKey });
    queryClient.setQueriesData<T>({ queryKey }, (data) => (data === undefined ? data : update(data)));
    return () => {
      for (const [key, data] of previous) queryClient.setQueryData(key, data);
    };
  };
}
