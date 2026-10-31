import { NativeTabs } from 'expo-router/native-tabs';

import { tripQueries } from '@/api/trip-queries';
import { Colors } from '@/constants/theme';
import { useTripLiveUpdates } from '@/hooks/use-trip-live-updates';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useMembership, useSession } from '@/session/session-provider';
import { entriesStillNeedingMyVote } from '@/utils/voting';

export default function TripLayout() {
  const { membership } = useSession();
  // Leaving the trip clears membership one render before the route guard navigates away;
  // unmounting the tabs here stops screens from rendering without a trip.
  if (!membership) return null;
  return <TripTabs />;
}

function TripTabs() {
  useTripLiveUpdates();
  const awaiting = useTripQuery(tripQueries.awaitingMyVote);
  const { player_id: myPlayerId } = useMembership();
  const awaitingCount = entriesStillNeedingMyVote(awaiting.data ?? [], myPlayerId).length;

  return (
    <NativeTabs
      backgroundColor={Colors.card}
      indicatorColor={Colors.accentSoft}
      labelStyle={{ selected: { color: Colors.accent } }}
      tintColor={Colors.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="photo.on.rectangle" md="dynamic_feed" />
        {awaitingCount > 0 ? <NativeTabs.Trigger.Badge>{String(awaitingCount)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="board">
        <NativeTabs.Trigger.Label>Board</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="trophy" md="leaderboard" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rules">
        <NativeTabs.Trigger.Label>Rules</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Label>Me</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
