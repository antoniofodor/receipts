import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Ground, Paper } from '@/constants/theme';
import { FixedLightMode } from '@/light-mode/light-mode-provider';

const labelColor = (title: string) => StyleSheet.flatten(screen.getByText(title).props.style).color;

describe('Button', () => {
  it('draws a secondary button in the ground text colour of the current light', async () => {
    await render(
      <FixedLightMode mode="night">
        <Button title="Leave trip" variant="secondary" onPress={() => {}} />
      </FixedLightMode>,
    );
    expect(labelColor('Leave trip')).toBe(Ground.night.text);
  });

  it('draws a secondary button in ink when it sits on a receipt', async () => {
    await render(
      <FixedLightMode mode="night">
        <Card seed="invite">
          <Button title="Share code" variant="secondary" onPress={() => {}} />
        </Card>
      </FixedLightMode>,
    );
    expect(labelColor('Share code')).toBe(Paper.ink);
  });

  it('lets the surface be named outright', async () => {
    await render(<Button title="Add player" variant="secondary" surface="paper" onPress={() => {}} />);
    expect(labelColor('Add player')).toBe(Paper.ink);
  });

  it('draws the primary key in the primary colours of the current light', async () => {
    await render(
      <FixedLightMode mode="night">
        <Button title="Find trip" onPress={() => {}} />
      </FixedLightMode>,
    );
    expect(labelColor('Find trip')).toBe(Ground.night.onPrimary);
    expect(screen.getByRole('button', { name: 'Find trip' })).toBeEnabled();
  });
});
