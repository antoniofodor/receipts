import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { subscribeToTripChanges, type LiveTable } from '@/api/realtime';
import { useTripLiveUpdates } from '@/hooks/use-trip-live-updates';
import { createTestQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/realtime', () => ({ subscribeToTripChanges: jest.fn() }));
jest.mock('@/session/session-provider', () => ({ useMembership: () => ({ trip_id: 'trip-1' }) }));

const subscribeMock = jest.mocked(subscribeToTripChanges);

async function renderLiveUpdates() {
  const unsubscribe = jest.fn();
  let handlers!: Parameters<typeof subscribeToTripChanges>[2];
  subscribeMock.mockImplementation((_tripId, _tables, tripHandlers) => {
    handlers = tripHandlers;
    return unsubscribe;
  });
  const queryClient = createTestQueryClient();
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = await renderHook(() => useTripLiveUpdates(), { wrapper });
  const invalidatedKeys = () => invalidate.mock.calls.map(([filters]) => filters?.queryKey);
  return { hook, emit: (table: LiveTable) => handlers.onChange(table), goLive: () => handlers.onLive(), invalidatedKeys, unsubscribe };
}

describe('useTripLiveUpdates', () => {
  it('subscribes to this trip only', async () => {
    await renderLiveUpdates();
    expect(subscribeMock).toHaveBeenCalledWith('trip-1', expect.arrayContaining(['entries', 'votes', 'rules']), expect.any(Object));
  });

  it('refreshes the queries affected by a change', async () => {
    const { emit, invalidatedKeys } = await renderLiveUpdates();

    emit('votes');

    expect(invalidatedKeys()).toEqual([
      ['feed', 'trip-1'],
      ['awaiting-my-vote', 'trip-1'],
      ['player-entries', 'trip-1'],
    ]);
  });

  it('refetches every live list once when changes start flowing, to catch anything missed while connecting', async () => {
    const { goLive, invalidatedKeys } = await renderLiveUpdates();

    goLive();

    expect(invalidatedKeys()).toEqual([
      ['feed', 'trip-1'],
      ['awaiting-my-vote', 'trip-1'],
      ['player-entries', 'trip-1'],
      ['leaderboard', 'trip-1'],
      ['rules', 'trip-1'],
    ]);
  });

  it('unsubscribes when the trip screens close', async () => {
    const { hook, unsubscribe } = await renderLiveUpdates();

    await hook.unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
