import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/card';
import { Paper } from '@/constants/theme';
import { receiptWear } from '@/utils/receipt-wear';

const ids = Array.from({ length: 40 }, (_, index) => `entry-${index}`);
const tapedId = ids.find((id) => receiptWear(id, 'full').taped)!;

function paperOf(text: string) {
  let paper = screen.getByText(text).parent;
  while (paper && StyleSheet.flatten(paper.props.style)?.backgroundColor !== Paper.paper) paper = paper.parent;
  return paper;
}

describe('Card', () => {
  it('keeps its rows positioned inside it, so they move with the card instead of animating on their own', async () => {
    await render(
      <Card seed="entry-1">
        <Text>Row</Text>
      </Card>,
    );
    expect(paperOf('Row')?.props.collapsable).toBe(false);
  });

  it('keeps the tape away from screen readers and touches', async () => {
    await render(
      <Card seed={tapedId}>
        <Text>Taped</Text>
      </Card>,
    );
    expect(screen.queryByTestId('receipt-tape')).toBeNull();
    expect(screen.getByTestId('receipt-tape', { includeHiddenElements: true }).props.pointerEvents).toBe('none');
  });

  it('prints the shared picture clean, with no tape', async () => {
    await render(
      <Card seed={tapedId} wear="none">
        <Text>Shared</Text>
      </Card>,
    );
    expect(paperOf('Shared')).toBeTruthy();
    expect(screen.queryByTestId('receipt-tape', { includeHiddenElements: true })).toBeNull();
  });
});
