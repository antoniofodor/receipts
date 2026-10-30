import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

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
});

describe('TripCodeField', () => {
  it('uppercases and keeps letters only, up to 6', async () => {
    const onChangeText = jest.fn();
    await render(<TripCodeField value="" onChangeText={onChangeText} onSubmit={() => {}} />);

    await fireEvent.changeText(screen.getByLabelText('Trip code'), 'tz-wy 7kvq');

    expect(onChangeText).toHaveBeenCalledWith('TZWYKV');
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
