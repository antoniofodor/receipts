import { render, screen } from '@testing-library/react-native';

import { EvidencePrint } from '@/components/feed/evidence-print';

const photo = { id: 'p1', path: 'trip/p1.jpg', url: 'https://example.test/p1.jpg', width: 1200, height: 1600 };

describe('EvidencePrint', () => {
  it('labels the photo for screen readers and keeps the exhibit caption and tape decorative', async () => {
    await render(<EvidencePrint photo={photo} source={{ uri: photo.url }} index={1} count={2} />);

    expect(screen.getByLabelText('Photo 2 of 2')).toBeOnTheScreen();
    expect(screen.queryByText('exhibit B')).toBeNull();
    expect(screen.getByText('exhibit B', { includeHiddenElements: true })).toBeTruthy();
  });
});
