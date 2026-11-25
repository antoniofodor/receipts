import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { MutedText } from '@/components/typography';
import { Ground, Paper } from '@/constants/theme';
import { FixedLightMode } from '@/light-mode/light-mode-provider';

const textColor = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style).color;

describe('Screen', () => {
  it('keeps the ScrollView first, so iOS still insets it for the status bar, tab bar and keyboard', async () => {
    await render(
      <View testID="navigator-screen">
        <Screen>
          <Text>Content</Text>
        </Screen>
      </View>,
    );
    const [first] = screen.getByTestId('navigator-screen').children;
    expect(typeof first === 'object' && first.type).toBe('RCTScrollView');
  });

  it('paints the ground with its decoration hidden from screen readers and touches', async () => {
    await render(
      <Screen>
        <Text>Content</Text>
      </Screen>,
    );
    expect(screen.queryByTestId('ground-background')).toBeNull();
    const background = screen.getByTestId('ground-background', { includeHiddenElements: true });
    expect(background.props.pointerEvents).toBe('none');
  });

  it('keeps muted text legible on the ground and on paper', async () => {
    await render(
      <FixedLightMode mode="night">
        <Screen>
          <MutedText>Nothing logged yet</MutedText>
          <Card seed="entry-1">
            <MutedText>Sending…</MutedText>
          </Card>
        </Screen>
      </FixedLightMode>,
    );
    expect(textColor('Nothing logged yet')).toBe(Ground.night.textMuted);
    expect(textColor('Sending…')).toBe(Paper.muted);
  });
});
