import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { castVote } from '@/api/entries';
import { haptics } from '@/components/haptics';
import { VotePanel } from '@/components/feed/vote-panel';
import { makeEntry, players, vote } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/entries', () => ({
  castVote: jest.fn().mockResolvedValue({ status: 'pending' }),
  getRecentEntries: jest.fn(),
  getEntriesAwaitingMyVote: jest.fn(),
}));
jest.mock('@/components/haptics', () => ({
  haptics: { tap: jest.fn(), tick: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));
jest.mock('@/session/session-provider', () => ({ useMembership: () => ({ trip_id: 'trip-1' }) }));

const castVoteMock = jest.mocked(castVote);

function renderPanel(entry = makeEntry(), me = players.sully.id) {
  return renderWithQueryClient(<VotePanel entry={entry} myPlayerId={me} votesNeeded={3} />);
}

describe('VotePanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lets a bystander approve', async () => {
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(castVoteMock).toHaveBeenCalledWith('entry-1', true));
  });

  it('buzzes success for an approval and a warning for a decline', async () => {
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Approve' }));
    expect(haptics.success).toHaveBeenCalledTimes(1);

    await renderPanel();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Decline' })[0]);
    expect(haptics.warning).toHaveBeenCalledTimes(1);
  });

  it('lets a bystander decline', async () => {
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Decline' }));

    await waitFor(() => expect(castVoteMock).toHaveBeenCalledWith('entry-1', false));
  });

  it('shows the tally and who has voted', async () => {
    await renderPanel(makeEntry({ votes: [vote('tommo', true), vote('dev', false)] }));

    expect(screen.getByText('1 of 3 approvals · 1 declined')).toBeTruthy();
    expect(screen.getByText('Approved by')).toBeTruthy();
    expect(screen.getByText('Tommo')).toBeTruthy();
    expect(screen.getByText('Declined by')).toBeTruthy();
    expect(screen.getByText('Dev')).toBeTruthy();
  });

  it('hides the buttons from the person who logged it', async () => {
    await renderPanel(makeEntry(), players.dev.id);

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.getByText('You logged this. The others decide.')).toBeTruthy();
  });

  it('hides the buttons from the person it is about', async () => {
    await renderPanel(makeEntry(), players.jonno.id);

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.getByText("This one's about you. The others decide.")).toBeTruthy();
  });

  it('shows my vote instead of the buttons once I have voted', async () => {
    await renderPanel(makeEntry({ votes: [vote('sully', true)] }));

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.getByText('You approved this')).toBeTruthy();
  });

  it('shows the database refusal if a vote fails', async () => {
    castVoteMock.mockRejectedValueOnce(new Error('Voting on this entry has closed'));
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Approve' }));

    expect(await screen.findByText('Voting on this entry has closed')).toBeTruthy();
  });
});
