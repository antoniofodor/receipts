import { router, useLocalSearchParams } from 'expo-router';

import type { Entry } from '@/api/entries';
import { tripQueries } from '@/api/trip-queries';
import { AnimatedListItem } from '@/components/animated-list-item';
import { BackLink } from '@/components/back-link';
import { EntryCard } from '@/components/feed/entry-card';
import { PlayerSummary } from '@/components/player/player-summary';
import { Screen } from '@/components/screen';
import { ErrorText, MutedText, SectionLabel } from '@/components/typography';
import { useKeptWhileFocused } from '@/hooks/use-kept-while-focused';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { newestFirst } from '@/utils/sort';

export default function PlayerScreen() {
  const membership = useMembership();
  const { id: playerId } = useLocalSearchParams<{ id: string }>();
  const entries = useTripQuery(tripQueries.playerEntries, playerId);
  const leaderboard = useTripQuery(tripQueries.leaderboard);
  const row = leaderboard.data?.find((each) => each.player_id === playerId);
  const pendingNow = entries.data?.filter((entry) => entry.status === 'pending') ?? null;
  const pending = useKeptWhileFocused(pendingNow, entries.data, newestFirst);
  const pendingIds = new Set(pending.items.map((entry) => entry.id));
  const confirmed = entries.data?.filter((entry) => !pendingIds.has(entry.id)) ?? [];

  const renderEntry = (entry: Entry, index: number) => (
    <AnimatedListItem key={entry.id} index={index}>
      <EntryCard entry={entry} myPlayerId={membership.player_id} votesNeeded={membership.vote_threshold} />
    </AnimatedListItem>
  );

  function refresh() {
    pending.release();
    return Promise.all([entries.refresh(), leaderboard.refresh()]);
  }

  return (
    <Screen refreshing={entries.refreshing || leaderboard.refreshing} onRefresh={refresh}>
      <BackLink label="Board" onPress={() => router.back()} />
      {row ? <PlayerSummary row={row} isMe={row.player_id === membership.player_id} /> : null}
      <ErrorText>{entries.error ?? leaderboard.error}</ErrorText>

      {row && entries.data?.length === 0 ? <MutedText>Nothing logged about {row.name} yet.</MutedText> : null}

      {pending.items.length > 0 ? (
        <>
          <SectionLabel count={pending.items.length}>Pending</SectionLabel>
          {pending.items.map(renderEntry)}
        </>
      ) : null}

      {confirmed.length > 0 ? (
        <>
          <SectionLabel count={confirmed.length}>Approved</SectionLabel>
          {confirmed.map(renderEntry)}
        </>
      ) : null}
    </Screen>
  );
}
