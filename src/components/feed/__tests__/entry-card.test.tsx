import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { EntryCard } from '@/components/feed/entry-card';
import { makeEntry, players, vote } from '@/test-utils/entry-fixture';
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

  it('opens the share sheet for the entry', async () => {
    await renderWithQueryClient(<EntryCard entry={makeEntry()} myPlayerId="sully" votesNeeded={3} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/share/[id]', params: { id: 'entry-1' } });
  });

  it('invites the first comment', async () => {
    await renderWithQueryClient(<EntryCard entry={makeEntry()} myPlayerId="sully" votesNeeded={3} />);

    expect(screen.getByRole('button', { name: 'Comment' })).toBeTruthy();
  });

  it('keeps list cards compact: my vote is an icon, and the voting details stay on the entry screen', async () => {
    const entry = makeEntry({ votes: [vote('sully', true), vote('tommo', true)] });
    await renderWithQueryClient(<EntryCard entry={entry} myPlayerId="sully" votesNeeded={3} />);

    expect(screen.getByLabelText('You approved this')).toBeTruthy();
    expect(screen.getByLabelText('2 of 3 approvals')).toBeTruthy();
    expect(screen.queryByText(/Approved by/)).toBeNull();
    expect(screen.queryByText(/of 3 approvals/)).toBeNull();
  });

  it('shows the full voting story on the entry screen', async () => {
    const entry = makeEntry({ votes: [vote('sully', true), vote('tommo', true)] });
    await renderWithQueryClient(<EntryCard entry={entry} myPlayerId="sully" votesNeeded={3} variant="detail" />);

    expect(screen.getByText('Approved by')).toBeTruthy();
    expect(screen.getByText('Sully, Tommo')).toBeTruthy();
    expect(screen.getByText('You approved this')).toBeTruthy();
  });

  it("shows no buttons on cards I can't vote on", async () => {
    await renderWithQueryClient(<EntryCard entry={makeEntry()} myPlayerId="dev" votesNeeded={3} />);

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByText(/The others decide/)).toBeNull();
  });

  it('names only the player the entry is about, with who logged it as a small badge', async () => {
    await renderWithQueryClient(<EntryCard entry={makeEntry()} myPlayerId="sully" votesNeeded={3} />);

    expect(screen.getByText('Jonno')).toBeTruthy();
    expect(screen.getByLabelText('Logged by Dev')).toBeTruthy();
    expect(screen.queryByText(/→/)).toBeNull();
  });

  it('marks a self-claim instead of naming the player twice', async () => {
    await renderWithQueryClient(
      <EntryCard entry={makeEntry({ filer: players.jonno })} myPlayerId="sully" votesNeeded={3} />,
    );

    expect(screen.getByLabelText('Self-claim')).toBeTruthy();
    expect(screen.queryByLabelText(/Logged by/)).toBeNull();
  });

  it('stamps APPROVED on an entry when it is approved while I watch', async () => {
    const card = (status: 'pending' | 'confirmed') => (
      <EntryCard entry={makeEntry({ status })} myPlayerId="sully" votesNeeded={3} />
    );
    const { rerender } = await renderWithQueryClient(card('pending'));
    expect(screen.queryByText('APPROVED')).toBeNull();

    await rerender(card('confirmed'));

    expect(screen.getByText('APPROVED')).toBeTruthy();
  });

  it('prints no stamp on an entry that was already approved', async () => {
    await renderWithQueryClient(
      <EntryCard entry={makeEntry({ status: 'confirmed' })} myPlayerId="sully" votesNeeded={3} />,
    );

    expect(screen.getByText('Approved')).toBeTruthy();
    expect(screen.queryByText('APPROVED')).toBeNull();
  });

  it('strikes through the points of a declined entry', async () => {
    await renderWithQueryClient(
      <EntryCard entry={makeEntry({ status: 'rejected' })} myPlayerId="sully" votesNeeded={3} />,
    );

    expect(screen.getByText('Declined')).toBeTruthy();
    expect(screen.getByText('−5')).toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('leaves the thread to the entry screen itself', async () => {
    await renderWithQueryClient(
      <EntryCard entry={makeEntry({ commentCount: 2 })} myPlayerId="sully" votesNeeded={3} variant="detail" />,
    );

    expect(screen.queryByRole('button', { name: '2 comments' })).toBeNull();
  });
});
