import { router } from 'expo-router';

import { getRecentEntries } from '@/api/entries';
import { Button } from '@/components/button';
import { EntryCard } from '@/components/feed/entry-card';
import { InviteCard } from '@/components/invite-card';
import { Screen } from '@/components/screen';
import { ErrorText, MutedText, Title } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export default function FeedScreen() {
  const membership = useMembership();
  const { data: entries, error, refreshing, refresh } = useTripQuery(getRecentEntries);
  const hasNoEntries = entries !== null && entries.length === 0;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Title subtitle={`You're in as ${membership.player_name}`}>{membership.trip_name}</Title>
      <Button title="Log points" onPress={() => router.push('/log')} />
      <ErrorText>{error}</ErrorText>
      {hasNoEntries ? (
        <>
          <MutedText>Nothing logged yet. Invite the group, then log the first receipt.</MutedText>
          <InviteCard membership={membership} />
        </>
      ) : null}
      {entries?.map((entry) => (
        <EntryCard key={entry.id} entry={entry} votesNeeded={membership.vote_threshold} />
      ))}
    </Screen>
  );
}
