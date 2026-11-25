import { StyleSheet } from 'react-native';

import { AccountButtons } from '@/components/account/account-buttons';
import { MutedText } from '@/components/typography';
import { useAccount } from '@/hooks/use-account';

export function JoinAccountOptions() {
  const account = useAccount();
  if (!account) return null;
  if (account.hasAccount) return <MutedText style={styles.centered}>Signed in as {account.email}</MutedText>;
  return <AccountButtons quiet />;
}

const styles = StyleSheet.create({ centered: { textAlign: 'center' } });
