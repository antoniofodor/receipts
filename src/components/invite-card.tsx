import { Share } from 'react-native';

import type { Membership } from '@/api/trips';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { LedWindow } from '@/components/receipt/led-window';
import { Label } from '@/components/typography';

export function InviteCard({ membership }: { membership: Membership }) {
  function shareCode() {
    Share.share({
      message: `Join "${membership.trip_name}" on Receipts. Trip code: ${membership.join_code}`,
    }).catch(() => {});
  }

  return (
    <Card seed="invite">
      <Label>Invite the group</Label>
      <LedWindow
        lit={membership.join_code}
        accessibilityLabel={`Trip code ${membership.join_code.split('').join(' ')}`}
      />
      <Button title="Share code" variant="secondary" onPress={shareCode} />
    </Card>
  );
}
