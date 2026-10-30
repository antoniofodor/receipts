import { fireEvent, render, screen } from '@testing-library/react-native';

import { maxVoteThreshold, VoteThresholdCard } from '@/components/create-trip/vote-threshold-card';

describe('maxVoteThreshold', () => {
  it('excludes the logger and the subject from voting', () => {
    expect(maxVoteThreshold(6)).toBe(4);
    expect(maxVoteThreshold(5)).toBe(3);
  });

  it('never drops below 1', () => {
    expect(maxVoteThreshold(3)).toBe(1);
    expect(maxVoteThreshold(0)).toBe(1);
  });
});

describe('VoteThresholdCard', () => {
  it('stops increasing at the maximum for the player count', async () => {
    const onChange = jest.fn();
    await render(<VoteThresholdCard value={3} playerCount={5} onChange={onChange} />);

    await fireEvent.press(screen.getByLabelText('Increase votes needed'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('stops decreasing at 1', async () => {
    const onChange = jest.fn();
    await render(<VoteThresholdCard value={1} playerCount={5} onChange={onChange} />);

    await fireEvent.press(screen.getByLabelText('Decrease votes needed'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('steps by one within range', async () => {
    const onChange = jest.fn();
    await render(<VoteThresholdCard value={2} playerCount={6} onChange={onChange} />);

    await fireEvent.press(screen.getByLabelText('Increase votes needed'));

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
