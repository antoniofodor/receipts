import { router, useLocalSearchParams } from 'expo-router';

import { AccountCodeStep } from '@/components/account/account-code-step';
import { AccountEmailStep } from '@/components/account/account-email-step';
import { BackLink } from '@/components/back-link';
import { SignTitle } from '@/components/ground/sign-title';
import { Screen } from '@/components/screen';
import { useAccountCodeFlow } from '@/hooks/use-account-code-flow';
import { useSession } from '@/session/session-provider';
import { accountPurposeFrom } from '@/utils/account';

export default function AccountScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const purpose = accountPurposeFrom(mode);
  const { membership } = useSession();
  const flow = useAccountCodeFlow(purpose, () => router.back());
  const leavesTrip =
    purpose === 'sign-in' && membership
      ? `This phone leaves ${membership.trip_name}. You can rejoin it with the trip code and your PIN.`
      : null;

  return (
    <Screen>
      <BackLink label="Close" onPress={() => router.back()} />
      <SignTitle>{purpose === 'create' ? 'Create account' : 'Sign in'}</SignTitle>
      {flow.sentTo ? (
        <AccountCodeStep flow={flow} confirmTitle={purpose === 'create' ? 'Create account' : 'Sign in'} />
      ) : (
        <AccountEmailStep flow={flow} warning={leavesTrip} />
      )}
    </Screen>
  );
}
