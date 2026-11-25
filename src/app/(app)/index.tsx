import type { Entry } from '@/api/entries';
import { tripQueries } from '@/api/trip-queries';
import { AnimatedListItem } from '@/components/animated-list-item';
import { EntryCard } from '@/components/feed/entry-card';
import { MyStandingPump } from '@/components/feed/my-standing-pump';
import { InviteCard } from '@/components/invite-card';
import { Screen } from '@/components/screen';
import { NeonSign } from '@/components/ground/neon-sign';
import { SignTitle } from '@/components/ground/sign-title';
import { TapeLabel } from '@/components/tape-label';
import { ErrorText, MutedText } from '@/components/typography';
import { useKeptWhileFocused } from '@/hooks/use-kept-while-focused';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { newestFirst } from '@/utils/sort';
import { entriesStillNeedingMyVote } from '@/utils/voting';

export default function FeedScreen() {
  const membership = useMembership();
  const feed = useTripQuery(tripQueries.feed);
  const awaiting = useTripQuery(tripQueries.awaitingMyVote);
  const voteSection = useKeptWhileFocused(awaiting.data, feed.data, newestFirst);
  const voteSectionIds = new Set(voteSection.items.map((entry) => entry.id));
  const otherEntries = feed.data?.filter((entry) => !voteSectionIds.has(entry.id)) ?? [];
  const stillNeedingMyVote = entriesStillNeedingMyVote(voteSection.items, membership.player_id).length;
  const hasNoEntries = feed.data !== null && feed.data.length === 0;

  const renderEntry = (entry: Entry, index: number) => (
    <AnimatedListItem key={entry.id} index={index}>
      <EntryCard entry={entry} myPlayerId={membership.player_id} votesNeeded={membership.vote_threshold} />
    </AnimatedListItem>
  );

  function refresh() {
    voteSection.release();
    return Promise.all([feed.refresh(), awaiting.refresh()]);
  }

  return (
    <Screen refreshing={feed.refreshing || awaiting.refreshing} onRefresh={refresh}>
      <SignTitle eyebrow={`${membership.trip_name} · ${membership.player_name}`} right={<NeonSign>Open</NeonSign>}>
        Feed
      </SignTitle>
      <MyStandingPump myPlayerId={membership.player_id} />
      <ErrorText>{feed.error ?? awaiting.error}</ErrorText>

      {hasNoEntries ? (
        <>
          <MutedText>Nothing logged yet. Invite the group, then log the first receipt.</MutedText>
          <InviteCard membership={membership} />
        </>
      ) : null}

      {voteSection.items.length > 0 ? (
        <>
          <TapeLabel count={stillNeedingMyVote > 0 ? stillNeedingMyVote : undefined}>Needs your vote</TapeLabel>
          {voteSection.items.map(renderEntry)}
        </>
      ) : null}

      {otherEntries.length > 0 ? (
        <>
          <TapeLabel>Recent</TapeLabel>
          {otherEntries.map(renderEntry)}
        </>
      ) : null}
    </Screen>
  );
}
