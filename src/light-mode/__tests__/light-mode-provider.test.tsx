import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { Ground } from '@/constants/theme';
import { LightModeProvider, useGround, useLightMode } from '@/light-mode/light-mode-provider';

const PREFERENCE_KEY = 'pointtracker.lightPreference';

function captureAppStateListener() {
  let listener: (state: AppStateStatus) => void = () => {};
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
    listener = handler as typeof listener;
    return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
  });
  return (state: AppStateStatus) => listener(state);
}

async function renderLightMode() {
  const hook = await renderHook(() => ({ ...useLightMode(), ground: useGround() }), {
    wrapper: LightModeProvider,
  });
  await waitFor(() => expect(hook.result.current.isLoaded).toBe(true));
  return hook;
}

describe('LightModeProvider', () => {
  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    await AsyncStorage.clear();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('follows the clock until the phone picks a mode', async () => {
    jest.setSystemTime(new Date(2026, 10, 24, 14, 0));
    const { result } = await renderLightMode();
    expect(result.current).toMatchObject({ preference: 'auto', mode: 'day', ground: Ground.day });
  });

  it('loads the mode this phone picked before', async () => {
    jest.setSystemTime(new Date(2026, 10, 24, 14, 0));
    await AsyncStorage.setItem(PREFERENCE_KEY, 'night');
    const { result } = await renderLightMode();
    expect(result.current).toMatchObject({ preference: 'night', mode: 'night', ground: Ground.night });
  });

  it('ignores a stored value it does not recognise', async () => {
    jest.setSystemTime(new Date(2026, 10, 24, 2, 0));
    await AsyncStorage.setItem(PREFERENCE_KEY, 'dusk');
    const { result } = await renderLightMode();
    expect(result.current).toMatchObject({ preference: 'auto', mode: 'night' });
  });

  it('remembers a new pick on the phone', async () => {
    jest.setSystemTime(new Date(2026, 10, 24, 14, 0));
    const { result } = await renderLightMode();
    await act(() => result.current.setPreference('night'));
    expect(result.current.mode).toBe('night');
    expect(await AsyncStorage.getItem(PREFERENCE_KEY)).toBe('night');
  });

  it('turns to night at 7pm while the app is open', async () => {
    jest.setSystemTime(new Date(2026, 10, 24, 18, 59, 30));
    const { result } = await renderLightMode();
    expect(result.current.mode).toBe('day');
    await act(() => jest.advanceTimersByTime(30_000));
    expect(result.current.mode).toBe('night');
  });

  it('checks the light again when the app comes back to the foreground', async () => {
    const emitAppState = captureAppStateListener();
    jest.setSystemTime(new Date(2026, 10, 24, 14, 0));
    const { result } = await renderLightMode();

    jest.setSystemTime(new Date(2026, 10, 24, 23, 0));
    await act(() => emitAppState('active'));
    expect(result.current.mode).toBe('night');
  });
});
