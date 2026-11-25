import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { getRulePacks } from '@/api/rule-packs';
import { createTrip } from '@/api/trips';
import CreateTripScreen from '@/app/create-trip';
import { renderWithQueryClient } from '@/test-utils/render-with-query-client';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@/api/trips', () => ({ createTrip: jest.fn().mockResolvedValue({}) }));
jest.mock('@/api/rule-packs', () => ({
  getRulePacks: jest.fn().mockResolvedValue([
    { id: 'classics', name: 'Trip classics', rules: [{ title: 'Drinking from a straw', points: -5 }] },
    { id: 'cabin-weekend', name: 'Cabin weekend', rules: [{ title: 'First to arrive', points: 10 }] },
  ]),
}));
const mockReloadMembership = jest.fn().mockResolvedValue(undefined);
jest.mock('@/session/session-provider', () => ({ useSession: () => ({ reloadMembership: mockReloadMembership }) }));

const createTripMock = jest.mocked(createTrip);

async function fillIn(label: string, text: string) {
  await fireEvent.changeText(screen.getByLabelText(label), text);
}

async function fillInSmallTrip() {
  await fillIn('Trip name', 'Lisbon');
  await fillIn('Your name', 'Dev');
  await fillIn('Player 2', 'Jonno');
  await fillIn('Player 3', 'Kev');
  await fillIn('Your PIN', '1234');
}

describe('Create trip screen', () => {
  beforeEach(() => {
    createTripMock.mockClear();
    mockReloadMembership.mockClear();
  });

  it('keeps the create button disabled until the trip is valid', async () => {
    await renderWithQueryClient(<CreateTripScreen />);
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
    await renderWithQueryClient(<CreateTripScreen />);
    await screen.findByText('Trip classics');
    await fillIn('Trip name', 'Lisbon');
    await fillIn('Your name', 'Dev');
    await fillIn('Player 2', 'Jonno');
    await fillIn('Player 3', 'Marco');
    await fillIn('Player 4', 'Kev');
    await fireEvent.press(screen.getAllByRole('checkbox', { name: 'Groom' })[2]);
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
      rulePackIds: ['classics'],
      customPackIds: [],
    });
  });

  it('caps votes needed at players minus 2', async () => {
    await renderWithQueryClient(<CreateTripScreen />);
    await fillInSmallTrip();

    await fireEvent.press(screen.getByRole('button', { name: 'Create trip' }));

    await waitFor(() => expect(createTripMock).toHaveBeenCalled());
    expect(createTripMock.mock.calls[0][0].voteThreshold).toBe(1);
  });

  it('creates the trip with the rule packs picked, in the order picked', async () => {
    await renderWithQueryClient(<CreateTripScreen />);
    await fireEvent.press(await screen.findByLabelText('Include Cabin weekend'));
    await fireEvent.press(screen.getByLabelText('Include Trip classics'));
    await fireEvent.press(screen.getByLabelText('Include Trip classics'));
    await fillInSmallTrip();

    await fireEvent.press(screen.getByRole('button', { name: 'Create trip' }));

    await waitFor(() => expect(createTripMock).toHaveBeenCalled());
    expect(createTripMock.mock.calls[0][0].rulePackIds).toEqual(['cabin-weekend', 'classics']);
  });

  it('can start with no rules', async () => {
    await renderWithQueryClient(<CreateTripScreen />);
    await fireEvent.press(await screen.findByLabelText('Include Trip classics'));
    expect(screen.getByText('Starting with no rules')).toBeOnTheScreen();
    await fillInSmallTrip();

    await fireEvent.press(screen.getByRole('button', { name: 'Create trip' }));

    await waitFor(() => expect(createTripMock).toHaveBeenCalled());
    expect(createTripMock.mock.calls[0][0].rulePackIds).toEqual([]);
  });

  it('shows what is in a pack before picking it', async () => {
    await renderWithQueryClient(<CreateTripScreen />);
    await fireEvent.press(await screen.findByLabelText('See the Cabin weekend rules'));
    expect(screen.getByText('First to arrive')).toBeOnTheScreen();
  });

  it("leaves the pack to the server when the catalog couldn't load", async () => {
    jest.mocked(getRulePacks).mockRejectedValueOnce(new Error('No connection. Check your signal and try again.'));
    await renderWithQueryClient(<CreateTripScreen />);
    expect(await screen.findByText('No connection. Check your signal and try again.')).toBeOnTheScreen();
    await fillInSmallTrip();

    await fireEvent.press(screen.getByRole('button', { name: 'Create trip' }));

    await waitFor(() => expect(createTripMock).toHaveBeenCalled());
    expect(createTripMock.mock.calls[0][0].rulePackIds).toBeUndefined();
  });
});
