import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { useSession } from '@/session/session-provider';

export default function TripTabs() {
  const { membership } = useSession();
  // Leaving the trip clears membership one render before the route guard navigates away;
  // unmounting the tabs here stops screens from rendering without a trip.
  if (!membership) return null;

  return (
    <NativeTabs
      backgroundColor={Colors.card}
      indicatorColor={Colors.accentSoft}
      labelStyle={{ selected: { color: Colors.accent } }}
      tintColor={Colors.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="photo.on.rectangle" md="dynamic_feed" />
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
