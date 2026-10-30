import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { createTrip } from '@/api/trips';
import CreateTripScreen from '@/app/create-trip';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@/api/trips', () => ({ createTrip: jest.fn().mockResolvedValue({}) }));
const mockReloadMembership = jest.fn().mockResolvedValue(undefined);
jest.mock('@/session/session-provider', () => ({ useSession: () => ({ reloadMembership: mockReloadMembership }) }));

const createTripMock = jest.mocked(createTrip);

async function fillIn(label: string, text: string) {
  await fireEvent.changeText(screen.getByLabelText(label), text);
}

describe('Create trip screen', () => {
  beforeEach(() => {
    createTripMock.mockClear();
    mockReloadMembership.mockClear();
  });

  it('keeps the create button disabled until the trip is valid', async () => {
    await render(<CreateTripScreen />);
    const create = screen.getByRole('button', { name: 'Create trip' });
    expect(create).toBeDisabled();

    await fillIn('Trip name', 'Lisbon');
    await fillIn('Your name', 'Dev');
    await fillIn('Player 2', 'Jonno');
    expect(create).toBeDisabled();

    await fillIn('Player 3', 'Kev');
    await fillIn('Your PIN', '1234');
    expect(create).toBeEnabled();
  });

  it('keeps the groom on the right person after removing a player above them', async () => {
    await render(<CreateTripScreen />);
    await fillIn('Trip name', 'Lisbon');
    await fillIn('Your name', 'Dev');
    await fillIn('Player 2', 'Jonno');
    await fillIn('Player 3', 'Marco');
    await fillIn('Player 4', 'Kev');
    await fireEvent.press(screen.getAllByRole('button', { name: '★ Groom' })[2]);
    await fireEvent.press(screen.getByLabelText('Remove Jonno'));
    await fillIn('Your PIN', '1234');

    await fireEvent.press(screen.getByRole('button', { name: 'Create trip' }));

    await waitFor(() => expect(mockReloadMembership).toHaveBeenCalled());
    expect(createTripMock).toHaveBeenCalledWith({
      name: 'Lisbon',
      organiserName: 'Dev',
      otherPlayerNames: ['Marco', 'Kev'],
      groomName: 'Marco',
      voteThreshold: 1,
      pin: '1234',
    });
  });

  it('caps votes needed at players minus 2', async () => {
    await render(<CreateTripScreen />);
    await fillIn('Trip name', 'Lisbon');
    await fillIn('Your name', 'Dev');
    await fillIn('Player 2', 'Jonno');
    await fillIn('Player 3', 'Kev');
    await fillIn('Your PIN', '1234');

    await fireEvent.press(screen.getByRole('button', { name: 'Create trip' }));

    await waitFor(() => expect(createTripMock).toHaveBeenCalled());
    expect(createTripMock.mock.calls[0][0].voteThreshold).toBe(1);
  });
});
