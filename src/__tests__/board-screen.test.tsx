import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { router } from 'expo-router';

import { getLeaderboard, type LeaderboardRow } from '@/api/leaderboard';
import BoardScreen from '@/app/(app)/board';
import { players } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/leaderboard', () => ({ getLeaderboard: jest.fn() }));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({
    trip_id: 'trip-1',
    trip_name: 'Lisbon',
    join_code: 'TZWYKV',
    player_id: 'sully',
    player_name: 'Sully',
    vote_threshold: 3,
  }),
}));

const row = (player: keyof typeof players, points: number, rank: number, pending = 0): LeaderboardRow => ({
  trip_id: 'trip-1',
  player_id: players[player].id,
  name: players[player].name,
  color: players[player].color,
  is_groom: false,
  points,
  pending_count: pending,
  rank,
  photo_path: null,
});

describe('Board screen', () => {
  beforeEach(() => {
    jest.mocked(getLeaderboard).mockResolvedValue([row('sully', 45, 1), row('tommo', 20, 2, 1), row('jonno', -5, 3)]);
  });

  it('prints the night as one receipt: the trip and a line per player, with no combined total', async () => {
    await renderWithQueryClient(<BoardScreen />);

    expect(await screen.findByText('Trip #TZWYKV · Lisbon')).toBeTruthy();
    const tommo = screen.getByRole('button', { name: "See Tommo's entries" });
    expect(within(tommo).getByText('02')).toBeTruthy();
    expect(within(tommo).getByText('+20')).toBeTruthy();
    expect(within(tommo).getByText('1 pending')).toBeTruthy();
    expect(screen.getByText('−5')).toBeTruthy();
    expect(screen.queryByText('Total')).toBeNull();
    expect(screen.queryByText('+60')).toBeNull();
    expect(screen.getByText('3 players')).toBeTruthy();
  });

  it('shows my own points and rank on the pump display, counting up to them', async () => {
    jest.mocked(getLeaderboard).mockResolvedValue([row('tommo', 20, 1), row('sully', 15, 2)]);
    await renderWithQueryClient(<BoardScreen />);

    expect(await screen.findByText('You · #2')).toBeTruthy();
    await waitFor(() => expect(screen.getAllByText('+15')).toHaveLength(2));
  });

  it('opens a player from their line', async () => {
    await renderWithQueryClient(<BoardScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: "See Jonno's entries" }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/player/[id]', params: { id: 'jonno' } });
  });
});
