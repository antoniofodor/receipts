import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { getPlayers, renameMe, type Player } from '@/api/players';
import { RenameMeCard } from '@/components/me/rename-me-card';
import { createTestQueryClient, renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]) };
});
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/players', () => ({ getPlayers: jest.fn(), renameMe: jest.fn() }));
const mockSetMyName = jest.fn();
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip-1', player_id: 'sully', player_name: 'Sully' }),
  useSession: () => ({ setMyName: mockSetMyName }),
}));

const player = (id: string, name: string): Player => ({
  id,
  name,
  color: '#2E6B57',
  is_groom: false,
  photo_path: null,
});
const PLAYERS = [player('sully', 'Sully'), player('jonno', 'Jonno')];

async function renderCard() {
  const onDone = jest.fn();
  const queryClient = createTestQueryClient();
  await renderWithQueryClient(<RenameMeCard onDone={onDone} />, queryClient);
  await screen.findByDisplayValue('Sully');
  await waitFor(() => expect(queryClient.getQueryData(['players', 'trip-1'])).toEqual(PLAYERS));
  return { onDone, queryClient, field: screen.getByLabelText('Your name') };
}

const saveButton = () => screen.getByRole('button', { name: 'Save name' });

describe('RenameMeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetMyName.mockResolvedValue(undefined);
    jest.mocked(getPlayers).mockResolvedValue(PLAYERS);
  });

  it('starts from my name, with nothing to save yet', async () => {
    await renderCard();

    expect(saveButton()).toBeDisabled();
  });

  it('saves the tidied name and shows it straight away, before the server answers', async () => {
    let answer!: (name: string) => void;
    jest.mocked(renameMe).mockReturnValue(new Promise((resolve) => (answer = resolve)));
    const { onDone, queryClient, field } = await renderCard();

    await fireEvent.changeText(field, '  Big   Sully ');
    await fireEvent.press(saveButton());

    await waitFor(() => expect(mockSetMyName).toHaveBeenCalledWith('Big Sully'));
    expect(queryClient.getQueryData<Player[]>(['players', 'trip-1'])?.map((p) => p.name)).toEqual([
      'Big Sully',
      'Jonno',
    ]);
    expect(renameMe).toHaveBeenCalledWith('trip-1', '  Big   Sully ');
    expect(onDone).not.toHaveBeenCalled();

    answer('Big Sully');

    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("won't offer to save a name someone else in the trip has, and says why", async () => {
    const { field } = await renderCard();

    await fireEvent.changeText(field, 'jonno');

    expect(screen.getByText('Someone in this trip is already called "jonno"')).toBeTruthy();
    expect(saveButton()).toBeDisabled();
  });

  it("won't offer to save an empty name", async () => {
    const { field } = await renderCard();

    await fireEvent.changeText(field, '   ');

    expect(saveButton()).toBeDisabled();
  });

  it('puts my old name back and shows why when the server refuses', async () => {
    jest.mocked(renameMe).mockRejectedValue(new Error('Someone in this trip is already called "Kev"'));
    const { onDone, queryClient, field } = await renderCard();

    await fireEvent.changeText(field, 'Kev');
    await fireEvent.press(saveButton());

    expect(await screen.findByText('Someone in this trip is already called "Kev"')).toBeTruthy();
    expect(mockSetMyName).toHaveBeenLastCalledWith('Sully');
    expect(queryClient.getQueryData<Player[]>(['players', 'trip-1'])?.map((p) => p.name)).toEqual(['Sully', 'Jonno']);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('closes without saving on Cancel', async () => {
    const { onDone } = await renderCard();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(onDone).toHaveBeenCalled();
    expect(renameMe).not.toHaveBeenCalled();
  });
});
