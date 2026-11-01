import { screen } from '@testing-library/react-native';

import { getPlayerEntries } from '@/api/entries';
import { getLeaderboard, type LeaderboardRow } from '@/api/leaderboard';
import PlayerScreen from '@/app/player/[id]';
import { makeEntry, players } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { back: jest.fn() },
    useLocalSearchParams: () => ({ id: 'tommo' }),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/entries', () => ({ castVote: jest.fn(), getPlayerEntries: jest.fn() }));
jest.mock('@/api/leaderboard', () => ({ getLeaderboard: jest.fn() }));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip-1', player_id: 'sully', player_name: 'Sully', vote_threshold: 3 }),
}));

const tommoRow: LeaderboardRow = {
  trip_id: 'trip-1',
  player_id: 'tommo',
  name: 'Tommo',
  color: players.tommo.color,
  is_groom: false,
  points: -5,
  pending_count: 1,
  rank: 4,
  photo_path: null,
};

describe('Player screen', () => {
  it("shows the player's standing, then their pending and approved entries", async () => {
    jest.mocked(getLeaderboard).mockResolvedValue([tommoRow]);
    jest.mocked(getPlayerEntries).mockResolvedValue([
      makeEntry({ id: 'pending', subject: players.tommo, rule: { title: 'Asleep before midnight' } }),
      makeEntry({
        id: 'confirmed',
        subject: players.tommo,
        status: 'confirmed',
        rule: { title: 'Drinking from a straw' },
      }),
    ]);

    await renderWithQueryClient(<PlayerScreen />);

    expect(await screen.findByText('Pending (1)')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Tommo' })).toBeTruthy();
    expect(screen.getByText('#4 · 1 pending')).toBeTruthy();
    expect(screen.getByText('Approved (1)')).toBeTruthy();
    expect(screen.getByText('Asleep before midnight')).toBeTruthy();
    expect(screen.getByText('Drinking from a straw')).toBeTruthy();
    expect(getPlayerEntries).toHaveBeenCalledWith('trip-1', 'tommo');
  });

  it('says so when nothing has been logged about the player', async () => {
    jest.mocked(getLeaderboard).mockResolvedValue([{ ...tommoRow, points: 0, pending_count: 0 }]);
    jest.mocked(getPlayerEntries).mockResolvedValue([]);

    await renderWithQueryClient(<PlayerScreen />);

    expect(await screen.findByText('Nothing logged about Tommo yet.')).toBeTruthy();
  });
});
