import { Share, StyleSheet, Text } from 'react-native';

import type { Membership } from '@/api/trips';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Label, MutedText } from '@/components/typography';
import { Colors, Fonts } from '@/constants/theme';

export function InviteCard({ membership }: { membership: Membership }) {
  function shareCode() {
    Share.share({
      message: `Join "${membership.trip_name}" on Receipts. Trip code: ${membership.join_code}`,
    }).catch(() => {});
  }

  return (
    <Card>
      <Label>Invite the group</Label>
      <Text style={styles.code} selectable accessibilityLabel={`Trip code ${membership.join_code.split('').join(' ')}`}>
        {membership.join_code}
      </Text>
      <MutedText>Everyone opens the app, enters this code and taps their name.</MutedText>
      <Button title="Share code" variant="secondary" onPress={shareCode} />
    </Card>
  );
}

const styles = StyleSheet.create({
  code: {
    fontFamily: Fonts.mono,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 10,
    color: Colors.accent,
    textAlign: 'center',
  },
});
