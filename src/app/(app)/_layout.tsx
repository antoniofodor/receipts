import { router } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';

import { tripQueries } from '@/api/trip-queries';
import { haptics } from '@/components/haptics';
import { Paper, Type } from '@/constants/theme';
import { useTripLiveUpdates } from '@/hooks/use-trip-live-updates';
import { useTripQuery } from '@/hooks/use-trip-query';
import { useGround } from '@/light-mode/light-mode-provider';
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
  const ground = useGround();
  const label = { fontFamily: Type.tabLabel.fontFamily, fontSize: Type.tabLabel.fontSize };

  return (
    <NativeTabs
      backgroundColor={ground.navBackground}
      shadowColor={ground.navBorder}
      indicatorColor={ground.line}
      badgeBackgroundColor={Paper.red}
      iconColor={{ default: ground.navIcon, selected: ground.navActive }}
      labelStyle={{
        default: { ...label, color: ground.navIcon },
        selected: { ...label, color: ground.navActive },
      }}
      tintColor={ground.navActive}>
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
