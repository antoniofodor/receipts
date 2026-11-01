import { router, useLocalSearchParams } from 'expo-router';

import { tripQueries } from '@/api/trip-queries';
import { BackLink } from '@/components/back-link';
import { Screen } from '@/components/screen';
import { ShareReceiptPanel } from '@/components/share/share-receipt-panel';
import { ErrorText, MutedText, Title } from '@/components/typography';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership } from '@/session/session-provider';

export default function ShareEntryScreen() {
  const membership = useMembership();
  const { id: entryId } = useLocalSearchParams<{ id: string }>();
  const entry = useTripQuery(tripQueries.entry, entryId);

  return (
    <Screen>
      <BackLink label="Close" onPress={() => router.back()} />
      <Title eyebrow="This is what gets sent">Share</Title>
      <ErrorText>{entry.error}</ErrorText>
      {entry.data ? <ShareReceiptPanel entry={entry.data} tripName={membership.trip_name} /> : null}
      {!entry.loading && !entry.error && entry.data === null ? (
        <MutedText>This entry isn&apos;t here anymore.</MutedText>
      ) : null}
    </Screen>
  );
}
