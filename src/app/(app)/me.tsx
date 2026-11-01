import { Alert, Text } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { InviteCard } from '@/components/invite-card';
import { ProfileHeader } from '@/components/me/profile-header';
import { LineItem } from '@/components/receipt/line-item';
import { Screen } from '@/components/screen';
import { ErrorText, Label } from '@/components/typography';
import { Type } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useMembership, useSession } from '@/session/session-provider';

export default function MeScreen() {
  const membership = useMembership();
  const { leave } = useSession();
  const { busy, error, run } = useAsyncAction();

  function confirmLeave() {
    Alert.alert(
      'Leave the trip on this phone?',
      `This phone stops being ${membership.player_name}. Your points stay. You can rejoin with the trip code and your PIN.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => run(leave) },
      ],
    );
  }

  const roles = [membership.is_organiser && 'Organiser', membership.is_groom && 'Groom'].filter(Boolean).join(' · ');

  return (
    <Screen>
      <ProfileHeader name={membership.player_name} roles={roles} />
      <Card>
        <Label>Trip</Label>
        <Text style={Type.heading}>{membership.trip_name}</Text>
        <LineItem
          label="Approvals needed"
          value={<Text style={[Type.points, { fontSize: 16 }]}>{membership.vote_threshold}</Text>}
        />
      </Card>
      <InviteCard membership={membership} />
      <ErrorText>{error}</ErrorText>
      <Button title="Leave trip on this phone" variant="secondary" onPress={confirmLeave} loading={busy} />
    </Screen>
  );
}
