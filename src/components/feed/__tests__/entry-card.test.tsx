import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { EntryCard } from '@/components/feed/entry-card';
import { makeEntry, vote } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip-1', player_id: 'sully', player_name: 'Sully', vote_threshold: 3 }),
}));

describe('EntryCard', () => {
  it('opens the thread from the comment count', async () => {
    await renderWithQueryClient(
      <EntryCard entry={makeEntry({ commentCount: 2 })} myPlayerId="sully" votesNeeded={3} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: '2 comments' }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/entry/[id]', params: { id: 'entry-1' } });
  });

  it('invites the first comment', async () => {
    await renderWithQueryClient(<EntryCard entry={makeEntry()} myPlayerId="sully" votesNeeded={3} />);

    expect(screen.getByRole('button', { name: 'Comment' })).toBeTruthy();
  });

  it('keeps list cards compact: my vote is an icon, and the voting details stay on the entry screen', async () => {
    const entry = makeEntry({ votes: [vote('sully', true), vote('tommo', true)] });
    await renderWithQueryClient(<EntryCard entry={entry} myPlayerId="sully" votesNeeded={3} />);

    expect(screen.getByLabelText('You confirmed this')).toBeTruthy();
    expect(screen.getByLabelText('2 of 3 confirms')).toBeTruthy();
    expect(screen.queryByText(/Confirmed by/)).toBeNull();
    expect(screen.queryByText(/of 3 confirms/)).toBeNull();
  });

  it('shows the full voting story on the entry screen', async () => {
    const entry = makeEntry({ votes: [vote('sully', true), vote('tommo', true)] });
    await renderWithQueryClient(<EntryCard entry={entry} myPlayerId="sully" votesNeeded={3} variant="detail" />);

    expect(screen.getByText('Confirmed by Sully, Tommo')).toBeTruthy();
    expect(screen.getByText('You confirmed this')).toBeTruthy();
  });

  it("shows no buttons on cards I can't vote on", async () => {
    await renderWithQueryClient(<EntryCard entry={makeEntry()} myPlayerId="dev" votesNeeded={3} />);

    expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull();
    expect(screen.queryByText(/The others decide/)).toBeNull();
  });

  it('leaves the thread to the entry screen itself', async () => {
    await renderWithQueryClient(
      <EntryCard entry={makeEntry({ commentCount: 2 })} myPlayerId="sully" votesNeeded={3} variant="detail" />,
    );

    expect(screen.queryByRole('button', { name: '2 comments' })).toBeNull();
  });
});
