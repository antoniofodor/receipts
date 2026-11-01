import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { showActionSheet } from '@/components/action-sheet';
import { PhotoPickerField } from '@/components/log/photo-picker-field';
import { usePhotoPicker } from '@/hooks/use-photo-picker';

jest.mock('@/hooks/use-photo-picker', () => ({ usePhotoPicker: jest.fn() }));
jest.mock('@/components/action-sheet', () => ({ showActionSheet: jest.fn() }));

const photo = (name: string) => ({ uri: `file:///${name}.jpg`, width: 1600, height: 1200 });
const takePhoto = jest.fn();
const choosePhotos = jest.fn();
const showActionSheetMock = jest.mocked(showActionSheet);

async function renderField({ photos = [photo('x')], photosLeft = 2, onAdd = jest.fn(), onRemove = jest.fn() } = {}) {
  await render(<PhotoPickerField photos={photos} photosLeft={photosLeft} onAdd={onAdd} onRemove={onRemove} />);
  return { onAdd, onRemove };
}

describe('PhotoPickerField', () => {
  beforeEach(() => {
    jest
      .mocked(usePhotoPicker)
      .mockReturnValue({ takePhoto, choosePhotos, takeProfilePhoto: jest.fn(), chooseProfilePhoto: jest.fn() });
    takePhoto.mockReset();
    choosePhotos.mockReset();
    showActionSheetMock.mockReset();
  });

  it('offers the camera or the library from a single button', async () => {
    showActionSheetMock.mockResolvedValue('camera');
    takePhoto.mockResolvedValue([photo('new')]);
    const { onAdd } = await renderField();

    await fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith([photo('new')]));
    expect(showActionSheetMock).toHaveBeenCalledWith('Add a photo', [
      { label: 'Take photo', value: 'camera' },
      { label: 'Choose from library', value: 'library' },
    ]);
  });

  it('asks the library only for as many photos as still fit', async () => {
    showActionSheetMock.mockResolvedValue('library');
    choosePhotos.mockResolvedValue([photo('a'), photo('b')]);
    const { onAdd } = await renderField({ photosLeft: 2 });

    await fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith([photo('a'), photo('b')]));
    expect(choosePhotos).toHaveBeenCalledWith(2);
  });

  it('does nothing when the menu is cancelled', async () => {
    showActionSheetMock.mockResolvedValue(null);
    const { onAdd } = await renderField();

    await fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));

    await waitFor(() => expect(showActionSheetMock).toHaveBeenCalled());
    expect(takePhoto).not.toHaveBeenCalled();
    expect(choosePhotos).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('removes a photo', async () => {
    const { onRemove } = await renderField({ photos: [photo('a')] });

    await fireEvent.press(screen.getByRole('button', { name: 'Remove photo 1' }));

    expect(onRemove).toHaveBeenCalledWith('file:///a.jpg');
  });

  it('hides the button once the entry has 3 photos', async () => {
    await renderField({ photos: [photo('a'), photo('b'), photo('c')], photosLeft: 0 });

    expect(screen.queryByRole('button', { name: 'Add photo' })).toBeNull();
  });

  it('explains how to fix a refused camera permission', async () => {
    showActionSheetMock.mockResolvedValue('camera');
    takePhoto.mockRejectedValue(
      new Error('Receipts needs camera access to take photos. You can allow it in Settings.'),
    );
    await renderField();

    await fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));

    expect(await screen.findByText(/allow it in Settings/)).toBeTruthy();
  });
});
