import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { LightsCard } from '@/components/me/lights-card';
import { LightModeProvider } from '@/light-mode/light-mode-provider';

describe('LightsCard', () => {
  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date(2026, 10, 24, 14, 0));
    await AsyncStorage.clear();
  });
  afterEach(() => jest.useRealTimers());

  it('follows the clock by default and says when night comes', async () => {
    await render(
      <LightModeProvider>
        <LightsCard />
      </LightModeProvider>,
    );

    expect(await screen.findByText('Night from 7pm')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeSelected();
  });

  it('keeps the phone on the picked light and stops counting down to the next change', async () => {
    await render(
      <LightModeProvider>
        <LightsCard />
      </LightModeProvider>,
    );

    await fireEvent.press(await screen.findByRole('radio', { name: 'Night' }));

    expect(screen.getByRole('radio', { name: 'Night' })).toBeSelected();
    expect(screen.queryByText('Night from 7pm')).toBeNull();
    await waitFor(async () => expect(await AsyncStorage.getItem('pointtracker.lightPreference')).toBe('night'));
  });
});
