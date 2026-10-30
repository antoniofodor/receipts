import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useMembership } from '@/session/session-provider';
import { errorMessage } from '@/utils/errors';

export function useTripQuery<T>(fetchForTrip: (tripId: string) => Promise<T>) {
  const { trip_id: tripId } = useMembership();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await fetchForTrip(tripId));
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, [fetchForTrip, tripId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return { data, error, refreshing, refresh };
}
