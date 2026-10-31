import { router, useLocalSearchParams } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { EntryCard } from '@/components/feed/entry-card';
import { EntryPhotos } from '@/components/feed/entry-photos';
import { Screen } from '@/components/screen';
import { ErrorText, MutedText } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export default function EntryScreen() {
  const membership = useMembership();
  const { id: entryId } = useLocalSearchParams<{ id: string }>();
  const entry = useTripQuery(tripQueries.entry, entryId);

  return (
    <Screen refreshing={entry.refreshing} onRefresh={entry.refresh}>
      <BackLink onPress={() => router.back()} />
      <ErrorText>{entry.error}</ErrorText>
      {entry.data ? (
        <>
          <EntryPhotos photos={entry.data.photos} layout="full" />
          <EntryCard
            entry={entry.data}
            myPlayerId={membership.player_id}
            votesNeeded={membership.vote_threshold}
            showPhotos={false}
          />
        </>
      ) : null}
      {!entry.loading && !entry.error && entry.data === null ? (
        <MutedText>This entry isn&apos;t here anymore.</MutedText>
      ) : null}
    </Screen>
  );
}
