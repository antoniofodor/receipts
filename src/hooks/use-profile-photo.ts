import { removeMyPhoto, setMyPhoto } from '@/api/avatars';
import type { LocalPhoto } from '@/api/photos';
import { queriesShowingPlayers, tripQueries } from '@/api/trip-queries';
import { useInvalidateTripQueries, useOptimisticTripUpdate, useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export function useProfilePhoto() {
  const { trip_id: tripId, player_id: myPlayerId } = useMembership();
  const players = useTripQuery(tripQueries.players);
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();
  const me = players.data?.find((player) => player.id === myPlayerId) ?? null;

  async function showMyPhoto(photoPath: string | null) {
    await updateOptimistically(tripQueries.players, (list) =>
      list.map((player) => (player.id === myPlayerId ? { ...player, photo_path: photoPath } : player)),
    );
    invalidate(queriesShowingPlayers);
  }

  return {
    me,
    async change(photo: LocalPhoto) {
      await showMyPhoto(await setMyPhoto(tripId, myPlayerId, photo));
    },
    async remove() {
      await removeMyPhoto(tripId);
      await showMyPhoto(null);
    },
  };
}
