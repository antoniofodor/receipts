import { render, screen } from '@testing-library/react-native';

import { NeonSign } from '@/components/ground/neon-sign';
import { SignTitle } from '@/components/ground/sign-title';

describe('SignTitle', () => {
  it('reads as one heading, with the letter tiles hidden from screen readers', async () => {
    await render(<SignTitle eyebrow="Lake weekend · Sam">Feed</SignTitle>);

    expect(screen.getByRole('header', { name: 'Feed' })).toBeOnTheScreen();
    expect(screen.queryByText('F')).toBeNull();
    expect(screen.getAllByText('E', { includeHiddenElements: true })).toHaveLength(2);
    expect(screen.getByText('Lake weekend · Sam')).toBeOnTheScreen();
  });
});

describe('NeonSign', () => {
  it('is decoration only, hidden from screen readers', async () => {
    await render(<NeonSign>Open</NeonSign>);

    expect(screen.queryByText('O')).toBeNull();
    expect(screen.getByTestId('neon-sign', { includeHiddenElements: true })).toBeTruthy();
  });
});
