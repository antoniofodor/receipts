import { Redirect } from 'expo-router';

import { Screen } from '@/components/screen';

// The middle "+" tab can't be selected: tapping it opens the log sheet over the current tab (see the trip
// layout). Only a link straight to this route lands here, and it goes on to the log sheet too.
export default function AddTabScreen() {
  return (
    <Screen>
      <Redirect href="/log" />
    </Screen>
  );
}
