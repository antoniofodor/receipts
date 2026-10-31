import { getEntriesAwaitingMyVote, getPlayerEntries, getRecentEntries } from '@/api/entries';
import { getLeaderboard } from '@/api/leaderboard';
import { getPlayers } from '@/api/players';
import type { LiveTable } from '@/api/realtime';
import { getRules } from '@/api/rules';

// Param narrows a query to one thing inside the trip (a player's entries). Each param gets its own cache entry,
// and invalidating the query refreshes all of them.
export type TripQuery<T, Param = void> = {
  name: string;
  fetch(tripId: string, param: Param): Promise<T>;
  refreshWhenChanged: LiveTable[];
};

type AnyTripQuery = TripQuery<unknown, never>;

export const tripQueries = {
  feed: { name: 'feed', fetch: getRecentEntries, refreshWhenChanged: ['entries', 'votes'] },
  awaitingMyVote: { name: 'awaiting-my-vote', fetch: getEntriesAwaitingMyVote, refreshWhenChanged: ['entries', 'votes'] },
  playerEntries: { name: 'player-entries', fetch: getPlayerEntries, refreshWhenChanged: ['entries', 'votes'] },
  leaderboard: { name: 'leaderboard', fetch: getLeaderboard, refreshWhenChanged: ['entries'] },
  rules: { name: 'rules', fetch: getRules, refreshWhenChanged: ['rules'] },
  players: { name: 'players', fetch: getPlayers, refreshWhenChanged: [] },
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
