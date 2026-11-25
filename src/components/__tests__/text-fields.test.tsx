import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, StyleSheet } from 'react-native';

import { PinField, TripCodeField } from '@/components/text-fields';

describe('PinField', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
  beforeEach(() => dismiss.mockClear());

  it('keeps digits only, up to 4', async () => {
    const onChangeText = jest.fn();
    await render(<PinField value="" onChangeText={onChangeText} accessibilityLabel="PIN" />);

    await fireEvent.changeText(screen.getByLabelText('PIN'), '1a2-34 5');

    expect(onChangeText).toHaveBeenCalledWith('1234');
  });

  it('closes the keyboard once the 4th digit is typed, since the iPhone number pad has no Done key', async () => {
    await render(<PinField value="123" onChangeText={() => {}} accessibilityLabel="PIN" />);

    await fireEvent.changeText(screen.getByLabelText('PIN'), '1234');

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it('leaves the keyboard open while the PIN is incomplete', async () => {
    await render(<PinField value="" onChangeText={() => {}} accessibilityLabel="PIN" />);

    await fireEvent.changeText(screen.getByLabelText('PIN'), '12');

    expect(dismiss).not.toHaveBeenCalled();
  });

  it('draws a box per digit, with dots when the PIN is hidden', async () => {
    await render(<PinField value="12" onChangeText={() => {}} hidden accessibilityLabel="PIN" />);

    const input = screen.getByLabelText('PIN');
    expect(StyleSheet.flatten(input.props.style).color).toBe('transparent');
    expect(
      screen.getAllByTestId('digit-box', { includeHiddenElements: true }).map((box) => box.props.children),
    ).toEqual(['•', '•', '', '']);
  });
});

describe('TripCodeField', () => {
  it('uppercases and keeps letters only, up to 6', async () => {
    const onChangeText = jest.fn();
    await render(<TripCodeField value="" onChangeText={onChangeText} onSubmit={() => {}} />);

    await fireEvent.changeText(screen.getByLabelText('Trip code'), 'tz-wy 7kvq');

    expect(onChangeText).toHaveBeenCalledWith('TZWYKV');
  });

  it("never shows the phone's own typing, only the cleaned code, so lowercase letters can't flash up", async () => {
    await render(<TripCodeField value="TZW" onChangeText={() => {}} onSubmit={() => {}} />);
    const input = screen.getByLabelText('Trip code');

    expect(StyleSheet.flatten(input.props.style).color).toBe('transparent');
    expect(input.props.caretHidden).toBe(true);
    expect(screen.getByTestId('trip-code-lit', { includeHiddenElements: true })).toHaveTextContent('TZW');
    expect(screen.getByTestId('trip-code-unlit', { includeHiddenElements: true })).toHaveTextContent('---');
  });

  it('only submits a complete code', async () => {
    const onSubmit = jest.fn();
    const { rerender } = await render(<TripCodeField value="TZW" onChangeText={() => {}} onSubmit={onSubmit} />);
    await fireEvent(screen.getByLabelText('Trip code'), 'submitEditing');
    expect(onSubmit).not.toHaveBeenCalled();

    await rerender(<TripCodeField value="TZWYKV" onChangeText={() => {}} onSubmit={onSubmit} />);
    await fireEvent(screen.getByLabelText('Trip code'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
