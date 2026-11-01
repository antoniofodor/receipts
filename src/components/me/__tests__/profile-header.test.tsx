import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { removeMyPhoto, setMyPhoto } from '@/api/avatars';
import { getPlayers, type Player } from '@/api/players';
import { showActionSheet } from '@/components/action-sheet';
import { ProfileHeader } from '@/components/me/profile-header';
import { usePhotoPicker } from '@/hooks/use-photo-picker';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]) };
});
jest.mock('@/api/supabase-client', () => ({ supabase: {} }));
jest.mock('@/api/avatars', () => ({ setMyPhoto: jest.fn(), removeMyPhoto: jest.fn() }));
jest.mock('@/api/players', () => ({ getPlayers: jest.fn() }));
jest.mock('@/components/action-sheet', () => ({ showActionSheet: jest.fn() }));
jest.mock('@/hooks/use-photo-picker', () => ({ usePhotoPicker: jest.fn() }));
jest.mock('@/session/session-provider', () => ({
  useMembership: () => ({ trip_id: 'trip-1', player_id: 'sully', player_name: 'Sully' }),
}));

const sully = (photo_path: string | null): Player => ({
  id: 'sully',
  name: 'Sully',
  color: '#2E6B57',
  is_groom: false,
  photo_path,
});
const picked = { uri: 'file:///me.jpg', width: 512, height: 512 };
const picker = {
  takePhoto: jest.fn(),
  choosePhotos: jest.fn(),
  takeProfilePhoto: jest.fn(),
  chooseProfilePhoto: jest.fn(),
};

// What the server returns once the change is saved, so the refetch after it agrees.
const serverNowHas = (photoPath: string | null) => jest.mocked(getPlayers).mockResolvedValue([sully(photoPath)]);

describe('ProfileHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePhotoPicker).mockReturnValue(picker);
  });

  it('shows my name and roles beside my photo', async () => {
    serverNowHas(null);
    await renderWithQueryClient(<ProfileHeader name="Sully" roles="Organiser" />);

    expect(screen.getByRole('header', { name: 'Sully' })).toBeTruthy();
    expect(screen.getByText('Organiser')).toBeTruthy();
  });

  it('adds a photo when I tap my avatar and pick one', async () => {
    serverNowHas(null);
    jest.mocked(showActionSheet).mockResolvedValue('library');
    picker.chooseProfilePhoto.mockResolvedValue(picked);
    jest.mocked(setMyPhoto).mockImplementation(async () => {
      serverNowHas('trip-1/sully/new.jpg');
      return 'trip-1/sully/new.jpg';
    });
    await renderWithQueryClient(<ProfileHeader name="Sully" roles="" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Add profile photo' }));

    await waitFor(() => expect(setMyPhoto).toHaveBeenCalledWith('trip-1', 'sully', picked));
    expect(await screen.findByRole('button', { name: 'Edit profile photo' })).toBeTruthy();
  });

  it('changes nothing when I back out of the picker', async () => {
    serverNowHas(null);
    jest.mocked(showActionSheet).mockResolvedValue('camera');
    picker.takeProfilePhoto.mockResolvedValue(null);
    await renderWithQueryClient(<ProfileHeader name="Sully" roles="" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Add profile photo' }));

    await waitFor(() => expect(picker.takeProfilePhoto).toHaveBeenCalled());
    expect(setMyPhoto).not.toHaveBeenCalled();
  });

  it('offers to change or remove a photo I already have, from the avatar itself', async () => {
    serverNowHas('trip-1/sully/old.jpg');
    jest.mocked(showActionSheet).mockResolvedValue('remove');
    jest.mocked(removeMyPhoto).mockImplementation(async () => {
      serverNowHas(null);
    });
    await renderWithQueryClient(<ProfileHeader name="Sully" roles="" />);
    expect(screen.queryByRole('button', { name: 'Remove photo' })).toBeNull();

    await fireEvent.press(await screen.findByRole('button', { name: 'Edit profile photo' }));

    expect(jest.mocked(showActionSheet).mock.calls[0][1]).toEqual([
      { label: 'Change photo', value: 'change' },
      { label: 'Remove photo', value: 'remove', destructive: true },
    ]);
    await waitFor(() => expect(removeMyPhoto).toHaveBeenCalledWith('trip-1'));
    expect(await screen.findByRole('button', { name: 'Add profile photo' })).toBeTruthy();
  });

  it('changes a photo I already have, one step further in', async () => {
    serverNowHas('trip-1/sully/old.jpg');
    jest.mocked(showActionSheet).mockResolvedValueOnce('change').mockResolvedValueOnce('library');
    picker.chooseProfilePhoto.mockResolvedValue(picked);
    jest.mocked(setMyPhoto).mockResolvedValue('trip-1/sully/new.jpg');
    await renderWithQueryClient(<ProfileHeader name="Sully" roles="" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Edit profile photo' }));

    await waitFor(() => expect(setMyPhoto).toHaveBeenCalledWith('trip-1', 'sully', picked));
    expect(removeMyPhoto).not.toHaveBeenCalled();
  });
});
