import { router } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';

import { tripQueries } from '@/api/trip-queries';
import { haptics } from '@/components/haptics';
import { Colors, Fonts } from '@/constants/theme';
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

function openLogSheet() {
  haptics.tap();
  router.push('/log');
}

function TripTabs() {
  useTripLiveUpdates();
  const awaiting = useTripQuery(tripQueries.awaitingMyVote);
  const { player_id: myPlayerId } = useMembership();
  const awaitingCount = entriesStillNeedingMyVote(awaiting.data ?? [], myPlayerId).length;

  return (
    <NativeTabs
      backgroundColor={Colors.background}
      indicatorColor={Colors.line}
      badgeBackgroundColor={Colors.red}
      labelStyle={{ default: { fontFamily: Fonts.bold }, selected: { fontFamily: Fonts.bold, color: Colors.ink } }}
      tintColor={Colors.ink}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="scroll" md="receipt_long" />
        {awaitingCount > 0 ? <NativeTabs.Trigger.Badge>{String(awaitingCount)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="board">
        <NativeTabs.Trigger.Label>Board</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="trophy" md="leaderboard" />
      </NativeTabs.Trigger>
      {/* Can't be selected, so the tab bar stays where it is while the log sheet opens over it. */}
      <NativeTabs.Trigger name="add" disabled listeners={{ tabPress: openLogSheet }}>
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
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
