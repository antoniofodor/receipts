import { Alert, StyleSheet, Text } from 'react-native';

import { deleteAccount, signOutOfAccount } from '@/api/account';
import { AccountButtons } from '@/components/account/account-buttons';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { LineItem } from '@/components/receipt/line-item';
import { ErrorText, Label } from '@/components/typography';
import { Fonts, Paper } from '@/constants/theme';
import { useAccount } from '@/hooks/use-account';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useSession } from '@/session/session-provider';

// Accounts are optional. Without one, everything lives on this phone's own sign-in; creating one keeps it all.
export function AccountCard() {
  const account = useAccount();
  const { startOverAfterSignInChange } = useSession();
  const { busy, error, run } = useAsyncAction();
  if (!account) return null;

  function confirmSignOut() {
    Alert.alert('Sign out on this phone?', 'Sign in again to pick up where you left off.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () =>
          run(async () => {
            await signOutOfAccount();
            await startOverAfterSignInChange();
          }),
      },
    ]);
  }

  return (
    <Card seed="account">
      <Label>Account</Label>
      {account.hasAccount ? (
        <>
          <LineItem label="Email" value={<Text style={styles.value}>{account.email}</Text>} />
          <ErrorText>{error}</ErrorText>
          <Button title="Sign out" variant="secondary" onPress={confirmSignOut} loading={busy} />
          <ConfirmDeleteButton
            label="Delete account"
            confirmTitle="Delete your account?"
            confirmMessage="This deletes your account and your rule packs, and this phone leaves its trip. Trips keep the entries and comments you made."
            onConfirm={async () => {
              await deleteAccount();
              await startOverAfterSignInChange();
            }}
          />
        </>
      ) : (
        <>
          <LineItem label="Saved on" value={<Text style={styles.value}>This phone only</Text>} />
          <AccountButtons />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  value: { flexShrink: 1, fontFamily: Fonts.bold, fontSize: 12, color: Paper.ink, textAlign: 'right' },
});
