import { liveTables, queriesRefreshedBy, tripQueries, tripQueryKey } from '@/api/trip-queries';

jest.mock('@/api/supabase-client', () => ({ supabase: {} }));

const names = (queries: { name: string }[]) => queries.map((query) => query.name).sort();

describe('trip queries', () => {
  it('refreshes the entry lists and nothing else when a vote comes in', () => {
    expect(names(queriesRefreshedBy('votes'))).toEqual(['awaiting-my-vote', 'entry', 'feed', 'player-entries']);
  });

  it('refreshes the leaderboard when an entry changes status', () => {
    expect(names(queriesRefreshedBy('entries'))).toEqual([
      'awaiting-my-vote',
      'entry',
      'feed',
      'leaderboard',
      'player-entries',
    ]);
  });

  it('refreshes every entry view when a photo is attached', () => {
    expect(names(queriesRefreshedBy('evidence'))).toEqual(['awaiting-my-vote', 'entry', 'feed', 'player-entries']);
  });

  it('refreshes the thread and the comment counts when someone comments', () => {
    expect(names(queriesRefreshedBy('comments'))).toEqual([
      'awaiting-my-vote',
      'comments',
      'entry',
      'feed',
      'player-entries',
    ]);
  });

  it('drops a deleted entry from every list and the board, though Realtime only reports the deletion log', () => {
    expect(names(queriesRefreshedBy('deleted_entries'))).toEqual([
      'awaiting-my-vote',
      'entry',
      'feed',
      'leaderboard',
      'player-entries',
    ]);
  });

  it('refreshes everywhere an avatar shows when a player changes their photo', () => {
    expect(names(queriesRefreshedBy('players'))).toEqual([
      'awaiting-my-vote',
      'comments',
      'entry',
      'feed',
      'leaderboard',
      'player-entries',
      'players',
    ]);
  });

  it('refreshes the rulebook when a rule is added', () => {
    expect(names(queriesRefreshedBy('rules'))).toEqual(['rules']);
  });

  it('subscribes to each live table once', () => {
    expect([...liveTables].sort()).toEqual([
      'comments',
      'deleted_entries',
      'entries',
      'evidence',
      'players',
      'rules',
      'votes',
    ]);
  });

  it('keys a player-scoped query per player, under a prefix that refreshes them all', () => {
    expect(tripQueryKey(tripQueries.playerEntries, 'trip-1', 'tommo')).toEqual(['player-entries', 'trip-1', 'tommo']);
    expect(tripQueryKey(tripQueries.playerEntries, 'trip-1')).toEqual(['player-entries', 'trip-1']);
  });

  it('gives every query a unique cache name', () => {
    const all = Object.values(tripQueries).map((query) => query.name);
    expect(new Set(all).size).toBe(all.length);
  });
});
