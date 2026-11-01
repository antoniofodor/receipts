import { act, renderHook } from '@testing-library/react-native';
import {
  Keyboard,
  TextInput,
  type KeyboardEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useFocusedInputAboveKeyboard } from '@/hooks/use-focused-input-above-keyboard';

const KEYBOARD_TOP = 500;

function focusInputAt(y: number, height: number) {
  jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
    measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) =>
      callback(0, y, 300, height),
  } as unknown as ReturnType<typeof TextInput.State.currentlyFocusedInput>);
}

async function renderWithScrollView() {
  let showKeyboard: (event: KeyboardEvent) => void = () => {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation((_event, listener) => {
    showKeyboard = listener as (event: KeyboardEvent) => void;
    return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
  });
  const scrollTo = jest.fn();
  const { result } = await renderHook(() => useFocusedInputAboveKeyboard());
  (result.current.scrollRef as { current: unknown }).current = { scrollTo };
  await act(() =>
    result.current.onScroll({
      nativeEvent: { contentOffset: { x: 0, y: 200 } },
    } as NativeSyntheticEvent<NativeScrollEvent>),
  );
  return {
    scrollTo,
    reveal: result.current.reveal,
    showKeyboard: () => showKeyboard({ endCoordinates: { screenY: KEYBOARD_TOP } } as KeyboardEvent),
  };
}

describe('useFocusedInputAboveKeyboard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('scrolls the whole focused field clear of the keyboard when it opens', async () => {
    focusInputAt(460, 80);
    const { scrollTo, showKeyboard } = await renderWithScrollView();

    showKeyboard();

    expect(scrollTo).toHaveBeenCalledWith({ y: 200 + (460 + 80 + Spacing.lg - KEYBOARD_TOP) });
  });

  it('leaves the screen alone when the field is already clear', async () => {
    focusInputAt(100, 50);
    const { scrollTo, showKeyboard } = await renderWithScrollView();

    showKeyboard();

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('reveals a field focused while the keyboard is already up, once it has laid out', async () => {
    jest.useFakeTimers();
    focusInputAt(480, 50);
    jest.spyOn(Keyboard, 'metrics').mockReturnValue({ screenX: 0, screenY: KEYBOARD_TOP, width: 390, height: 300 });
    const { scrollTo, reveal } = await renderWithScrollView();

    reveal();
    expect(scrollTo).not.toHaveBeenCalled();
    jest.runAllTimers();

    expect(scrollTo).toHaveBeenCalledWith({ y: 200 + (480 + 50 + Spacing.lg - KEYBOARD_TOP) });
  });

  it('does nothing while the keyboard is closed', async () => {
    jest.useFakeTimers();
    focusInputAt(480, 50);
    jest.spyOn(Keyboard, 'metrics').mockReturnValue(undefined);
    const { scrollTo, reveal } = await renderWithScrollView();

    reveal();
    jest.runAllTimers();

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
