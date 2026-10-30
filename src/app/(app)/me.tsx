import { Alert, Text } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { InviteCard } from '@/components/invite-card';
import { Screen } from '@/components/screen';
import { ErrorText, Label, MutedText, Title } from '@/components/typography';
import { Colors } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useMembership, useSession } from '@/session/session-provider';
import { pluralize } from '@/utils/format';

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
      <Title subtitle={roles || undefined}>{membership.player_name}</Title>
      <Card>
        <Label>Trip</Label>
        <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.ink }}>{membership.trip_name}</Text>
        <MutedText>
          Points count once {pluralize(membership.vote_threshold, 'player confirms', 'players confirm')} them. You
          can&apos;t vote on entries you logged or that are about you.
        </MutedText>
      </Card>
      <InviteCard membership={membership} />
      <ErrorText>{error}</ErrorText>
      <Button title="Leave trip on this phone" variant="secondary" onPress={confirmLeave} loading={busy} />
    </Screen>
  );
}
