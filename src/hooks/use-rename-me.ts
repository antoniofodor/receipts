import { renameMe } from '@/api/players';
import { queriesShowingPlayers, tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate } from '@/hooks/use-trip-query';
import { useMembership, useSession } from '@/session/session-provider';
import { normalisePlayerName, withPlayerRenamed } from '@/utils/player-name';

// The new name shows on this phone at once: in the session, the player list and the board. Entries and comments
// carry the name inside each row, so they wait for the refetch.
export function useRenameMe() {
  const { trip_id: tripId, player_id: myPlayerId, player_name: currentName } = useMembership();
  const { setMyName } = useSession();
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  async function showName(name: string) {
    const undoPlayers = await updateOptimistically(tripQueries.players, (players) =>
      withPlayerRenamed(players, (player) => player.id, myPlayerId, name),
    );
    const undoBoard = await updateOptimistically(tripQueries.leaderboard, (rows) =>
      withPlayerRenamed(rows, (row) => row.player_id, myPlayerId, name),
    );
    await setMyName(name);
    return async () => {
      undoPlayers();
      undoBoard();
      await setMyName(currentName);
    };
  }

  return async (name: string) => {
    const undo = await showName(normalisePlayerName(name));
    try {
      await setMyName(await renameMe(tripId, name));
    } catch (error) {
      await undo();
      throw error;
    }
    invalidate(queriesShowingPlayers);
  };
}
