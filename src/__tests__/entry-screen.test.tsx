import { screen } from '@testing-library/react-native';

import { getEntry } from '@/api/entries';
import EntryScreen from '@/app/entry/[id]';
import { makeEntry } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { back: jest.fn(), push: jest.fn() },
    useLocalSearchParams: () => ({ id: 'entry-1' }),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/entries', () => ({ castVote: jest.fn(), getEntry: jest.fn() }));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip-1', player_id: 'sully', player_name: 'Sully', vote_threshold: 3 }),
}));

const photo = { id: 'p1', path: 'trip-1/entry-1/1.jpg', width: 1600, height: 1200, url: 'https://x/1' };

describe('Entry screen', () => {
  it('shows the photos full size above the entry and its vote buttons', async () => {
    jest.mocked(getEntry).mockResolvedValue(makeEntry({ photos: [photo] }));

    await renderWithQueryClient(<EntryScreen />);

    expect(await screen.findByLabelText('Photo 1 of 1')).toBeTruthy();
    expect(screen.getByText('Drinking from a straw')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Open photos' })).toBeNull();
    expect(getEntry).toHaveBeenCalledWith('trip-1', 'entry-1');
  });

  it('says so when the entry is gone', async () => {
    jest.mocked(getEntry).mockResolvedValue(null);

    await renderWithQueryClient(<EntryScreen />);

    expect(await screen.findByText("This entry isn't here anymore.")).toBeTruthy();
  });
});
