import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { EntryComments } from '@/components/comments/entry-comments';
import { DeleteEntryButton } from '@/components/feed/delete-entry-button';
import { EntryCard } from '@/components/feed/entry-card';
import { EntryPhotos } from '@/components/feed/entry-photos';
import { Screen } from '@/components/screen';
import { ShareEntryButton } from '@/components/share/share-entry-button';
import { ErrorText, MutedText } from '@/components/typography';
import { Colors } from '@/constants/theme';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';
import { canDeleteEntry } from '@/utils/voting';

export default function EntryScreen() {
  const membership = useMembership();
  const { id: entryId } = useLocalSearchParams<{ id: string }>();
  const entry = useTripQuery(tripQueries.entry, entryId);

  return (
    <Screen refreshing={entry.refreshing} onRefresh={entry.refresh}>
      <View style={styles.header}>
        <BackLink onPress={() => router.back()} />
        {entry.data ? <ShareEntryButton entryId={entry.data.id} color={Colors.ink} /> : null}
      </View>
      <ErrorText>{entry.error}</ErrorText>
      {entry.data ? (
        <>
          <EntryPhotos photos={entry.data.photos} layout="full" />
          <EntryCard
            entry={entry.data}
            myPlayerId={membership.player_id}
            votesNeeded={membership.vote_threshold}
            variant="detail"
          />
          {canDeleteEntry(entry.data, membership.player_id) ? (
            <DeleteEntryButton entryId={entry.data.id} onDeleted={() => router.back()} />
          ) : null}
          <EntryComments entryId={entry.data.id} />
        </>
      ) : null}
      {!entry.loading && !entry.error && entry.data === null ? (
        <MutedText>This entry isn&apos;t here anymore.</MutedText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
