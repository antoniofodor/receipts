import { randomUUID } from 'expo-crypto';

import { addComment, type Comment } from '@/api/comments';
import type { Entry } from '@/api/entries';
import { entryListQueries, tripQueries } from '@/api/trip-queries';
import { Colors } from '@/constants/theme';
import { useInvalidateTripQueries, useOptimisticTripUpdate, useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export function useAddComment(entryId: string) {
  const membership = useMembership();
  const players = useTripQuery(tripQueries.players);
  const updateOptimistically = useOptimisticTripUpdate();
  const invalidate = useInvalidateTripQueries();

  async function send(body: string, parentId: string | null) {
    const me = players.data?.find((player) => player.id === membership.player_id);
    const draft: Comment = {
      id: randomUUID(),
      entry_id: entryId,
      parent_id: parentId,
      body: body.trim(),
      created_at: new Date().toISOString(),
      author: { id: membership.player_id, name: membership.player_name, color: me?.color ?? Colors.muted },
      sending: true,
    };
    const countOneMore = (entry: Entry) =>
      entry.id === entryId ? { ...entry, commentCount: entry.commentCount + 1 } : entry;

    const undos = await Promise.all([
      updateOptimistically(tripQueries.comments, (comments) => [...comments, draft], entryId),
      ...entryListQueries.map((query) => updateOptimistically(query, (entries) => entries.map(countOneMore))),
      updateOptimistically(tripQueries.entry, (entry) => entry && countOneMore(entry)),
    ]);
    try {
      await addComment(entryId, body, parentId);
    } catch (caught) {
      for (const undo of undos) undo();
      throw caught;
    } finally {
      invalidate([tripQueries.comments, ...entryListQueries, tripQueries.entry]);
    }
  }

  return send;
}
