import { fireEvent, render, screen } from '@testing-library/react-native';

import { LeaderboardList } from '@/components/board/leaderboard-list';
import { players } from '@/test-utils/entry-fixture';

const row = {
  trip_id: 'trip-1',
  player_id: 'tommo',
  name: 'Tommo',
  color: players.tommo.color,
  is_groom: false,
  points: -5,
  pending_count: 0,
  rank: 1,
};

describe('LeaderboardList', () => {
  it('opens a player when their row is tapped', async () => {
    const onPressPlayer = jest.fn();
    await render(<LeaderboardList rows={[row]} myPlayerId="sully" onPressPlayer={onPressPlayer} />);

    await fireEvent.press(screen.getByRole('button', { name: "See Tommo's entries" }));

    expect(onPressPlayer).toHaveBeenCalledWith('tommo');
  });
});
