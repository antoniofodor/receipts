import { fireEvent, render, screen } from '@testing-library/react-native';

import { haptics } from '@/components/haptics';
import { NumberStepper } from '@/components/number-stepper';
import { formatPoints } from '@/utils/format';

jest.mock('@/components/haptics', () => ({
  haptics: { tap: jest.fn(), tick: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));

function renderStepper(value: number, onChange = jest.fn()) {
  return render(
    <NumberStepper value={value} min={-20} max={-1} onChange={onChange} label="entry points" format={formatPoints} />,
  );
}

describe('NumberStepper', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the value on the pump display', async () => {
    await renderStepper(-15);

    expect(screen.getByText('−15')).toBeTruthy();
    expect(screen.getByLabelText('entry points: −15')).toBeTruthy();
  });

  it('steps along the number line, so + moves a penalty toward zero', async () => {
    const onChange = jest.fn();
    await renderStepper(-5, onChange);

    await fireEvent.press(screen.getByRole('button', { name: 'Increase entry points' }));
    expect(onChange).toHaveBeenLastCalledWith(-4);

    await fireEvent.press(screen.getByRole('button', { name: 'Decrease entry points' }));
    expect(onChange).toHaveBeenLastCalledWith(-6);
  });

  it('gives a soft tick on each step', async () => {
    await renderStepper(-5);

    await fireEvent.press(screen.getByRole('button', { name: 'Increase entry points' }));

    expect(haptics.tick).toHaveBeenCalledTimes(1);
  });

  it("won't step past its limits", async () => {
    const onChange = jest.fn();
    await renderStepper(-1, onChange);

    await fireEvent.press(screen.getByRole('button', { name: 'Increase entry points' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
