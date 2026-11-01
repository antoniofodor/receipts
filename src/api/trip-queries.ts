import { getComments } from '@/api/comments';
import { getEntriesAwaitingMyVote, getEntry, getPlayerEntries, getRecentEntries } from '@/api/entries';
import { getLeaderboard } from '@/api/leaderboard';
import { getPlayers } from '@/api/players';
import type { LiveTable } from '@/api/realtime';
import { getRules } from '@/api/rules';

// Param narrows a query to one thing inside the trip (an entry, its comments, a player's entries). Each param gets its own cache entry,
// and invalidating the query refreshes all of them.
export type TripQuery<T, Param = void> = {
  name: string;
  fetch(tripId: string, param: Param): Promise<T>;
  refreshWhenChanged: LiveTable[];
};

type AnyTripQuery = TripQuery<unknown, never>;

// Everything shown on an entry card: its status, votes, photos, comment count and the players' photos.
// A deleted entry is heard about through deleted_entries, since Realtime can't route a delete to one trip.
const ENTRY_TABLES: LiveTable[] = ['entries', 'deleted_entries', 'votes', 'evidence', 'comments', 'players'];

export const tripQueries = {
  feed: { name: 'feed', fetch: getRecentEntries, refreshWhenChanged: ENTRY_TABLES },
  awaitingMyVote: {
    name: 'awaiting-my-vote',
    fetch: getEntriesAwaitingMyVote,
    refreshWhenChanged: ENTRY_TABLES,
  },
  playerEntries: {
    name: 'player-entries',
    fetch: getPlayerEntries,
    refreshWhenChanged: ENTRY_TABLES,
  },
  entry: { name: 'entry', fetch: getEntry, refreshWhenChanged: ENTRY_TABLES },
  comments: { name: 'comments', fetch: getComments, refreshWhenChanged: ['comments', 'players'] },
  leaderboard: {
    name: 'leaderboard',
    fetch: getLeaderboard,
    refreshWhenChanged: ['entries', 'deleted_entries', 'players'],
  },
  rules: { name: 'rules', fetch: getRules, refreshWhenChanged: ['rules'] },
  players: { name: 'players', fetch: getPlayers, refreshWhenChanged: ['players'] },
} satisfies Record<string, AnyTripQuery>;

export const allTripQueries: AnyTripQuery[] = Object.values(tripQueries);

export function tripQueryKey(query: AnyTripQuery, tripId: string, param?: string) {
  return param === undefined ? [query.name, tripId] : [query.name, tripId, param];
}

export function queriesRefreshedBy(table: LiveTable) {
  return allTripQueries.filter((query) => query.refreshWhenChanged.includes(table));
}

export const liveTables = [...new Set(allTripQueries.flatMap((query) => query.refreshWhenChanged))];

export const liveQueries = allTripQueries.filter((query) => query.refreshWhenChanged.length > 0);

// Every list holding entries, so a change to one entry reaches each cached copy of it.
export const entryListQueries = [tripQueries.feed, tripQueries.awaitingMyVote, tripQueries.playerEntries];
