import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert, type AlertButton } from 'react-native';

import { addComment, getComments, type Comment } from '@/api/comments';
import { deleteEntry, getEntry } from '@/api/entries';
import EntryScreen from '@/app/entry/[id]';
import { makeEntry, players } from '@/test-utils/entry-fixture';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: { back: jest.fn(), push: jest.fn() },
    useLocalSearchParams: () => ({ id: 'entry-1' }),
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});
jest.mock('expo-crypto', () => ({ randomUUID: () => 'draft-id' }));
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/entries', () => ({ castVote: jest.fn(), deleteEntry: jest.fn(), getEntry: jest.fn() }));
jest.mock('@/api/comments', () => ({
  ...jest.requireActual('@/api/comments'),
  getComments: jest.fn(),
  addComment: jest.fn(),
}));
jest.mock('@/api/players', () => ({ getPlayers: jest.fn().mockResolvedValue([]) }));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip-1', player_id: 'sully', player_name: 'Sully', vote_threshold: 3 }),
}));

const photo = { id: 'p1', path: 'trip-1/entry-1/1.jpg', width: 1600, height: 1200, url: 'https://x/1' };

const comment = (id: string, author: keyof typeof players, body: string, parentId: string | null = null): Comment => ({
  id,
  entry_id: 'entry-1',
  parent_id: parentId,
  body,
  created_at: '2026-10-31T12:00:00Z',
  author: players[author],
});

describe('Entry screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getEntry).mockResolvedValue(makeEntry({ photos: [photo] }));
    jest.mocked(getComments).mockResolvedValue([]);
  });

  it('shows the photos full size above the entry and its vote buttons', async () => {
    await renderWithQueryClient(<EntryScreen />);

    expect(await screen.findByLabelText('Photo 1 of 1')).toBeTruthy();
    expect(screen.getByText('Drinking from a straw')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Open photos' })).toBeNull();
    expect(getEntry).toHaveBeenCalledWith('trip-1', 'entry-1');
  });

  it('says so when the entry is gone', async () => {
    jest.mocked(getEntry).mockResolvedValue(null);

    await renderWithQueryClient(<EntryScreen />);

    expect(await screen.findByText("This entry isn't here anymore.")).toBeTruthy();
  });

  it('nests replies under the comment they answer', async () => {
    jest
      .mocked(getComments)
      .mockResolvedValue([
        comment('c1', 'dev', 'It was a stirrer'),
        comment('c2', 'tommo', 'Lies'),
        comment('r1', 'jonno', 'Stirrers have no liquid going up them', 'c1'),
      ]);

    await renderWithQueryClient(<EntryScreen />);

    const replies = await screen.findByLabelText('Replies to Dev');
    expect(within(replies).getByText('Stirrers have no liquid going up them')).toBeTruthy();
    expect(within(replies).queryByText('Lies')).toBeNull();
    expect(screen.getByText('Comments (3)')).toBeTruthy();
  });

  it('shows my comment straight away while the server saves it', async () => {
    jest.mocked(addComment).mockReturnValue(new Promise(() => {}));
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.changeText(await screen.findByLabelText('Comment'), 'Absolutely guilty');
    await fireEvent(screen.getByLabelText('Comment'), 'submitEditing');

    expect(await screen.findByText('Absolutely guilty')).toBeTruthy();
    expect(screen.getByText('Sending…')).toBeTruthy();
    expect(screen.getByLabelText('Comment').props.value).toBe('');
    expect(addComment).toHaveBeenCalledWith('entry-1', 'Absolutely guilty', null);
  });

  it('comments on the post itself from the box at the bottom', async () => {
    jest.mocked(getComments).mockResolvedValue([comment('c1', 'dev', 'Stirrer')]);
    jest.mocked(addComment).mockResolvedValue('new-id');
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.changeText(await screen.findByLabelText('Comment'), 'Guilty');
    await fireEvent(screen.getByLabelText('Comment'), 'submitEditing');

    await waitFor(() => expect(addComment).toHaveBeenCalledWith('entry-1', 'Guilty', null));
  });

  it('replies inside a thread by tapping one of its comments', async () => {
    jest.mocked(getComments).mockResolvedValue([comment('c1', 'dev', 'Stirrer'), comment('r1', 'jonno', 'No', 'c1')]);
    jest.mocked(addComment).mockResolvedValue('new-id');
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Reply to Jonno' }));
    await fireEvent.changeText(screen.getByLabelText('Your reply'), 'Yes');
    await fireEvent(screen.getByLabelText('Your reply'), 'submitEditing');

    await waitFor(() => expect(addComment).toHaveBeenCalledWith('entry-1', 'Yes', 'c1'));
    await waitFor(() => expect(screen.queryByLabelText('Your reply')).toBeNull());
  });

  it('keeps the bottom box for the post while a reply box is open', async () => {
    jest.mocked(getComments).mockResolvedValue([comment('c1', 'dev', 'Stirrer')]);
    jest.mocked(addComment).mockResolvedValue('new-id');
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Reply to Dev' }));
    await fireEvent.changeText(screen.getByLabelText('Comment'), 'On the post');
    await fireEvent(screen.getByLabelText('Comment'), 'submitEditing');

    await waitFor(() => expect(addComment).toHaveBeenCalledWith('entry-1', 'On the post', null));
  });

  it('sends from the keyboard, so there are no send buttons on screen', async () => {
    jest.mocked(getComments).mockResolvedValue([comment('c1', 'dev', 'Stirrer')]);
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Reply to Dev' }));

    expect(screen.getByLabelText('Your reply').props.returnKeyType).toBe('send');
    expect(screen.getByLabelText('Comment').props.returnKeyType).toBe('send');
    expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Comment' })).toBeNull();
  });

  it('never sends a blank comment', async () => {
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.changeText(await screen.findByLabelText('Comment'), '   ');
    await fireEvent(screen.getByLabelText('Comment'), 'submitEditing');

    expect(addComment).not.toHaveBeenCalled();
  });

  it('closes a reply box with Cancel', async () => {
    jest.mocked(getComments).mockResolvedValue([comment('c1', 'dev', 'Stirrer')]);
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Reply to Dev' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel reply' }));

    expect(screen.queryByLabelText('Your reply')).toBeNull();
  });

  it('gives my text back and explains why if the server refuses the comment', async () => {
    jest.mocked(addComment).mockRejectedValue(new Error('Comments can be up to 1000 characters'));
    await renderWithQueryClient(<EntryScreen />);

    await fireEvent.changeText(await screen.findByLabelText('Comment'), 'Too long');
    await fireEvent(screen.getByLabelText('Comment'), 'submitEditing');

    expect(await screen.findByText('Comments can be up to 1000 characters')).toBeTruthy();
    expect(screen.getByLabelText('Comment').props.value).toBe('Too long');
    expect(screen.queryByText('Sending…')).toBeNull();
  });

  describe('deleting', () => {
    const answerAlertWith = (choice: 'Delete' | 'Cancel') =>
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons?: AlertButton[]) => {
        buttons?.find((button) => button.text === choice)?.onPress?.();
      });

    afterEach(() => jest.restoreAllMocks());

    it('lets me delete an entry I logged while it is still pending, after I confirm', async () => {
      jest.mocked(getEntry).mockResolvedValue(makeEntry({ filer: players.sully }));
      jest.mocked(deleteEntry).mockResolvedValue();
      answerAlertWith('Delete');
      await renderWithQueryClient(<EntryScreen />);

      await fireEvent.press(await screen.findByRole('button', { name: 'Delete entry' }));

      await waitFor(() => expect(router.back).toHaveBeenCalled());
      expect(deleteEntry).toHaveBeenCalledWith('entry-1');
    });

    it('keeps the entry when I cancel', async () => {
      jest.mocked(getEntry).mockResolvedValue(makeEntry({ filer: players.sully }));
      answerAlertWith('Cancel');
      await renderWithQueryClient(<EntryScreen />);

      await fireEvent.press(await screen.findByRole('button', { name: 'Delete entry' }));

      expect(deleteEntry).not.toHaveBeenCalled();
    });

    it('explains why if the server refuses, and leaves me on the entry', async () => {
      jest.mocked(getEntry).mockResolvedValue(makeEntry({ filer: players.sully }));
      jest
        .mocked(deleteEntry)
        .mockRejectedValue(new Error("The votes are in on this entry, so it can't be deleted anymore"));
      answerAlertWith('Delete');
      await renderWithQueryClient(<EntryScreen />);

      await fireEvent.press(await screen.findByRole('button', { name: 'Delete entry' }));

      expect(await screen.findByText("The votes are in on this entry, so it can't be deleted anymore")).toBeTruthy();
      expect(router.back).not.toHaveBeenCalled();
    });

    it("doesn't offer to delete someone else's entry", async () => {
      await renderWithQueryClient(<EntryScreen />);
      expect(await screen.findByText('Drinking from a straw')).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Delete entry' })).toBeNull();
    });
  });
});
