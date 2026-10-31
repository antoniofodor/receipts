import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { castVote, getEntriesAwaitingMyVote, getRecentEntries } from '@/api/entries';
import FeedScreen from '@/app/(app)/index';
import { makeEntry, players, vote } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/entries', () => ({
  castVote: jest.fn(),
  getRecentEntries: jest.fn(),
  getEntriesAwaitingMyVote: jest.fn(),
}));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({
    trip_id: 'trip-1',
    player_id: 'sully',
    player_name: 'Sully',
    trip_name: 'Lisbon',
    join_code: 'TZWYKV',
    vote_threshold: 3,
  }),
}));

const needsVote = makeEntry({ id: 'needs-vote', rule: { title: 'Drinking from a straw' } });
const alreadyDecided = makeEntry({
  id: 'decided',
  status: 'confirmed',
  rule: { title: 'Asleep before midnight' },
  subject: players.tommo,
});

describe('Feed screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('puts entries needing my vote in their own section, without repeating them below', async () => {
    jest.mocked(getRecentEntries).mockResolvedValue([needsVote, alreadyDecided]);
    jest.mocked(getEntriesAwaitingMyVote).mockResolvedValue([needsVote]);

    await renderWithQueryClient(<FeedScreen />);

    expect(await screen.findByText('Needs your vote · 1')).toBeTruthy();
    expect(screen.getByText('Recent')).toBeTruthy();
    expect(screen.getAllByText('Drinking from a straw')).toHaveLength(1);
    expect(screen.getByText('Asleep before midnight')).toBeTruthy();
  });

  it('shows the invite card before anything is logged', async () => {
    jest.mocked(getRecentEntries).mockResolvedValue([]);
    jest.mocked(getEntriesAwaitingMyVote).mockResolvedValue([]);

    await renderWithQueryClient(<FeedScreen />);

    expect(await screen.findByText('TZWYKV')).toBeTruthy();
    expect(screen.queryByText(/Needs your vote/)).toBeNull();
  });

  it('shows my vote straight away, while the server is still saving it', async () => {
    jest.mocked(getRecentEntries).mockResolvedValue([needsVote]);
    jest.mocked(getEntriesAwaitingMyVote).mockResolvedValue([needsVote]);
    jest.mocked(castVote).mockReturnValue(new Promise(() => {}));
    await renderWithQueryClient(<FeedScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('You confirmed this')).toBeTruthy();
    expect(screen.getByText('Confirmed by Sully')).toBeTruthy();
    expect(screen.getByText('Needs your vote')).toBeTruthy();
  });

  it('keeps an entry I voted on in place after the server saves it, instead of moving it under Recent', async () => {
    const votedOn = makeEntry({ ...needsVote, votes: [vote('sully', true)] });
    jest.mocked(getRecentEntries).mockResolvedValue([needsVote]);
    jest.mocked(getEntriesAwaitingMyVote).mockResolvedValue([needsVote]);
    jest.mocked(castVote).mockResolvedValue({ status: 'pending', confirms: 1, rejects: 0, threshold: 3 });
    await renderWithQueryClient(<FeedScreen />);
    jest.mocked(getRecentEntries).mockResolvedValue([votedOn]);
    jest.mocked(getEntriesAwaitingMyVote).mockResolvedValue([]);

    await fireEvent.press(await screen.findByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(getEntriesAwaitingMyVote).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('You confirmed this')).toBeTruthy();
    expect(screen.getByText('Needs your vote')).toBeTruthy();
    expect(screen.queryByText('Recent')).toBeNull();
  });

  it('puts the buttons back and explains why if the server refuses my vote', async () => {
    jest.mocked(getRecentEntries).mockResolvedValue([needsVote]);
    jest.mocked(getEntriesAwaitingMyVote).mockResolvedValue([needsVote]);
    jest.mocked(castVote).mockRejectedValue(new Error('Voting on this entry has closed'));
    await renderWithQueryClient(<FeedScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Voting on this entry has closed')).toBeTruthy();
    expect(screen.queryByText('You confirmed this')).toBeNull();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
  });
});
