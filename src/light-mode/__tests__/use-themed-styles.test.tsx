import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { Ground, type GroundPalette } from '@/constants/theme';
import { FixedLightMode } from '@/light-mode/light-mode-provider';
import { useThemedStyles } from '@/light-mode/use-themed-styles';
import type { LightMode } from '@/utils/light-mode';

const makeStyles = jest.fn((ground: GroundPalette) => StyleSheet.create({ title: { color: ground.text } }));

function inLight(mode: LightMode) {
  return function LightWrapper({ children }: PropsWithChildren) {
    return <FixedLightMode mode={mode}>{children}</FixedLightMode>;
  };
}

describe('useThemedStyles', () => {
  it('builds styles once per light and shares them between components', async () => {
    const first = await renderHook(() => useThemedStyles(makeStyles), { wrapper: inLight('night') });
    const second = await renderHook(() => useThemedStyles(makeStyles), { wrapper: inLight('night') });
    const day = await renderHook(() => useThemedStyles(makeStyles), { wrapper: inLight('day') });

    expect(first.result.current).toBe(second.result.current);
    expect(first.result.current.title.color).toBe(Ground.night.text);
    expect(day.result.current.title.color).toBe(Ground.day.text);
    expect(makeStyles).toHaveBeenCalledTimes(2);
  });
});
