import { View } from 'react-native';

import type { PreviewPlayer } from '@/api/trips';
import { Avatar } from '@/components/avatar';
import { BackLink } from '@/components/back-link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PIN_LENGTH, PinField } from '@/components/text-fields';
import { ErrorText, Label, MutedText, Title } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Spacing } from '@/constants/theme';

type PinStepProps = {
  tripName: string;
  player: PreviewPlayer;
  pin: string;
  onChangePin: (pin: string) => void;
  onJoin: () => void;
  onBack: () => void;
  busy: boolean;
  error: string | null;
};

export function PinStep({ tripName, player, pin, onChangePin, onJoin, onBack, busy, error }: PinStepProps) {
  const isFirstJoin = !player.has_joined;

  return (
    <>
      <BackLink onPress={onBack} />
      <View style={[sharedStyles.row, { gap: Spacing.md }]}>
        <Avatar name={player.name} color={player.color} photoPath={player.photo_path} size={48} />
        <Title subtitle={tripName}>{player.name}</Title>
      </View>
      <Card>
        <Label>{isFirstJoin ? 'Choose a 4-digit PIN' : 'Enter your PIN'}</Label>
        <PinField
          value={pin}
          onChangeText={onChangePin}
          hidden={!isFirstJoin}
          autoFocus
          accessibilityLabel={isFirstJoin ? 'New PIN' : 'PIN'}
        />
        {isFirstJoin ? <MutedText>You&apos;ll need it on a new phone.</MutedText> : null}
      </Card>
      <ErrorText>{error}</ErrorText>
      <Button
        title={isFirstJoin ? 'Set PIN and join' : 'Join'}
        onPress={onJoin}
        loading={busy}
        disabled={pin.length !== PIN_LENGTH}
      />
    </>
  );
}
