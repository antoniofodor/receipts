import { render, screen } from '@testing-library/react-native';

import { TapeLabel } from '@/components/tape-label';

describe('TapeLabel', () => {
  it('reads as a heading with its count', async () => {
    await render(<TapeLabel count={2}>Needs your vote</TapeLabel>);
    expect(screen.getByRole('header', { name: 'Needs your vote, 2' })).toBeOnTheScreen();
  });

  it('reads just the words when there is nothing to count', async () => {
    await render(<TapeLabel>Recent</TapeLabel>);
    expect(screen.getByRole('header', { name: 'Recent' })).toBeOnTheScreen();
  });
});
