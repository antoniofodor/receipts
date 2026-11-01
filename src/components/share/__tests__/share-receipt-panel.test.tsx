import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { captureRef } from 'react-native-view-shot';

import { haptics } from '@/components/haptics';
import { saveImageToPhotos, saveOriginalPhotos, shareReceiptImage } from '@/components/share/share-actions';
import { ShareReceiptPanel } from '@/components/share/share-receipt-panel';
import { makeEntry } from '@/test-utils/entry-fixture';

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('@/components/share/share-actions', () => ({
  shareReceiptImage: jest.fn(),
  saveImageToPhotos: jest.fn(),
  saveOriginalPhotos: jest.fn(),
}));
jest.mock('@/components/haptics', () => ({
  haptics: { tap: jest.fn(), tick: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));

const photo = { id: 'p1', path: 'trip-1/entry-1/1.jpg', width: 1600, height: 1200, url: 'https://x/1' };

describe('ShareReceiptPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(captureRef).mockResolvedValue('file:///receipt.png');
  });

  it('shows the receipt that will be sent', async () => {
    await render(<ShareReceiptPanel entry={makeEntry({ note: 'Caught red-handed' })} tripName="Lisbon" />);

    expect(screen.getByText('Lisbon')).toBeTruthy();
    expect(screen.getByText('Jonno')).toBeTruthy();
    expect(screen.getByText('Caught red-handed')).toBeTruthy();
    expect(screen.getByText('*** Sent from Receipts ***')).toBeTruthy();
  });

  it('shares a picture of the receipt with a caption', async () => {
    await render(<ShareReceiptPanel entry={makeEntry()} tripName="Lisbon" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));

    await waitFor(() =>
      expect(shareReceiptImage).toHaveBeenCalledWith(
        'file:///receipt.png',
        expect.stringContaining('Jonno: Drinking from a straw'),
      ),
    );
  });

  it('saves the receipt picture to Photos and says so', async () => {
    await render(<ShareReceiptPanel entry={makeEntry()} tripName="Lisbon" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save receipt to Photos' }));

    expect(await screen.findByText('Saved the receipt to your photos.')).toBeTruthy();
    expect(saveImageToPhotos).toHaveBeenCalledWith('file:///receipt.png');
    expect(haptics.success).toHaveBeenCalled();
  });

  it('saves the original photos, and only offers to when there are some', async () => {
    const { rerender } = await render(<ShareReceiptPanel entry={makeEntry()} tripName="Lisbon" />);
    expect(screen.queryByRole('button', { name: /Save original/ })).toBeNull();

    await rerender(<ShareReceiptPanel entry={makeEntry({ photos: [photo] })} tripName="Lisbon" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save original photo' }));

    expect(await screen.findByText('Saved 1 photo to your photos.')).toBeTruthy();
    expect(saveOriginalPhotos).toHaveBeenCalledWith([photo]);
  });

  it("waits for the photo to load before taking the picture, so it's never half-drawn", async () => {
    await render(<ShareReceiptPanel entry={makeEntry({ photos: [photo] })} tripName="Lisbon" />);

    expect(screen.getByRole('button', { name: 'Share' })).toBeDisabled();
  });

  it('explains why if saving is refused', async () => {
    jest
      .mocked(saveImageToPhotos)
      .mockRejectedValue(new Error('Receipts needs permission to add to your photos. You can allow it in Settings.'));
    await render(<ShareReceiptPanel entry={makeEntry()} tripName="Lisbon" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save receipt to Photos' }));

    expect(await screen.findByText(/needs permission to add to your photos/)).toBeTruthy();
  });
});
