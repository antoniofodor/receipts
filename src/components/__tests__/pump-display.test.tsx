import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { PumpDisplay } from '@/components/receipt/pump-display';
import { Ground } from '@/constants/theme';
import { pumpDigits } from '@/utils/pump-digits';

describe('pumpDigits', () => {
  it('pads to three digits, leaving the leading zeros unlit', () => {
    expect(pumpDigits(35)).toEqual({ sign: '', unlit: '0', lit: '35', spoken: '35' });
    expect(pumpDigits(0)).toEqual({ sign: '', unlit: '00', lit: '0', spoken: '0' });
    expect(pumpDigits(1250)).toEqual({ sign: '', unlit: '', lit: '1250', spoken: '1250' });
  });

  it('keeps a negative sign in front of the zeros', () => {
    expect(pumpDigits(-5)).toEqual({ sign: '−', unlit: '00', lit: '5', spoken: '−5' });
  });
});

describe('PumpDisplay', () => {
  it('shows a window per number and reads the real value, not the padded one', async () => {
    await render(
      <PumpDisplay
        cells={[
          { label: 'Your total', value: 35 },
          { label: 'Pending', value: 2 },
          { label: 'Rank', value: 3 },
        ]}
      />,
    );
    expect(screen.getByLabelText('Your total: 35')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pending: 2')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rank: 3')).toBeOnTheScreen();
  });

  it('dims the leading zeros and lights negative amounts red', async () => {
    await render(<PumpDisplay cells={[{ label: 'Total', value: -5 }]} />);
    const unlit = screen.getByText('00', { includeHiddenElements: true });
    expect(StyleSheet.flatten(unlit.props.style).opacity).toBe(0.18);
    expect(StyleSheet.flatten(screen.getByText('5').props.style).color).toBe(Ground.day.ledNegative);
  });
});
