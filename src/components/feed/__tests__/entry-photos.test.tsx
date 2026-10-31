import { fireEvent, render, screen } from '@testing-library/react-native';

import { EntryPhotos } from '@/components/feed/entry-photos';

const photo = (id: string) => ({ id, path: `trip/entry/${id}.jpg`, width: 1600, height: 1200, url: `https://x/${id}` });

describe('EntryPhotos', () => {
  it('shows nothing for an entry without photos', async () => {
    await render(<EntryPhotos photos={[]} layout="strip" onPress={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Open photos' })).toBeNull();
  });

  it('opens the entry when the photos in a card are tapped', async () => {
    const onPress = jest.fn();
    await render(<EntryPhotos photos={[photo('1'), photo('2')]} layout="strip" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Open photos' }));

    expect(onPress).toHaveBeenCalled();
  });

  it('shows every photo full size on the entry screen', async () => {
    await render(<EntryPhotos photos={[photo('1'), photo('2')]} layout="full" />);

    expect(screen.getByLabelText('Photo 1 of 2')).toBeTruthy();
    expect(screen.getByLabelText('Photo 2 of 2')).toBeTruthy();
  });
});
