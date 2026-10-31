import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { castVote } from '@/api/entries';
import { VotePanel } from '@/components/feed/vote-panel';
import { makeEntry, players, vote } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/entries', () => ({
  castVote: jest.fn().mockResolvedValue({ status: 'pending' }),
  getRecentEntries: jest.fn(),
  getEntriesAwaitingMyVote: jest.fn(),
}));
jest.mock('@/session/session-provider', () => ({ useMembership: () => ({ trip_id: 'trip-1' }) }));

const castVoteMock = jest.mocked(castVote);

function renderPanel(entry = makeEntry(), me = players.sully.id) {
  return renderWithQueryClient(<VotePanel entry={entry} myPlayerId={me} votesNeeded={3} />);
}

describe('VotePanel', () => {
  beforeEach(() => castVoteMock.mockClear());

  it('lets a bystander confirm', async () => {
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(castVoteMock).toHaveBeenCalledWith('entry-1', true));
  });

  it('lets a bystander reject', async () => {
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => expect(castVoteMock).toHaveBeenCalledWith('entry-1', false));
  });

  it('shows the tally and who has voted', async () => {
    await renderPanel(makeEntry({ votes: [vote('tommo', true), vote('dev', false)] }));

    expect(screen.getByText('1 of 3 confirms · 1 of 3 rejects')).toBeTruthy();
    expect(screen.getByText('Confirmed by Tommo')).toBeTruthy();
    expect(screen.getByText('Rejected by Dev')).toBeTruthy();
  });

  it('hides the buttons from the person who logged it', async () => {
    await renderPanel(makeEntry(), players.dev.id);

    expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull();
    expect(screen.getByText('You logged this. The others decide.')).toBeTruthy();
  });

  it('hides the buttons from the person it is about', async () => {
    await renderPanel(makeEntry(), players.jonno.id);

    expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull();
    expect(screen.getByText("This one's about you. The others decide.")).toBeTruthy();
  });

  it('shows my vote instead of the buttons once I have voted', async () => {
    await renderPanel(makeEntry({ votes: [vote('sully', true)] }));

    expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull();
    expect(screen.getByText('You confirmed this')).toBeTruthy();
  });

  it('shows the database refusal if a vote fails', async () => {
    castVoteMock.mockRejectedValueOnce(new Error('Voting on this entry has closed'));
    await renderPanel();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Voting on this entry has closed')).toBeTruthy();
  });
});
