import { callFunction } from '@/api/request';
import { createTrip } from '@/api/trips';

jest.mock('@/api/request', () => ({ callFunction: jest.fn() }));

const callFunctionMock = jest.mocked(callFunction);

describe('createTrip', () => {
  beforeEach(() => callFunctionMock.mockReset());

  it('puts the organiser first and sends the groom as an index', async () => {
    await createTrip({
      name: 'Lisbon',
      organiserName: 'Dev',
      otherPlayerNames: ['Jonno', 'Marco', 'Kev'],
      groomName: 'Marco',
      voteThreshold: 2,
      pin: '1234',
    });

    expect(callFunctionMock).toHaveBeenCalledWith('create_trip', {
      p_name: 'Lisbon',
      p_player_names: ['Dev', 'Jonno', 'Marco', 'Kev'],
      p_my_index: 0,
      p_pin: '1234',
      p_groom_index: 2,
      p_vote_threshold: 2,
    });
  });

  it('sends no groom when none is picked', async () => {
    await createTrip({
      name: 'Lisbon',
      organiserName: 'Dev',
      otherPlayerNames: ['Jonno', 'Kev'],
      groomName: null,
      voteThreshold: 1,
      pin: '1234',
    });

    expect(callFunctionMock.mock.calls[0][1]).toMatchObject({ p_groom_index: null });
  });
});
