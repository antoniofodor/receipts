import { StyleSheet, Text, View } from 'react-native';

import type { PreviewPlayer, TripPreview } from '@/api/trips';
import { Avatar } from '@/components/avatar';
import { BackLink } from '@/components/back-link';
import { Card } from '@/components/card';
import { SignTitle } from '@/components/ground/sign-title';
import { PressableScale } from '@/components/pressable-scale';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { Fonts, Paper, Spacing, Type } from '@/constants/theme';

type PlayerStepProps = {
  trip: TripPreview;
  onPickPlayer: (player: PreviewPlayer) => void;
  onBack: () => void;
};

export function PlayerStep({ trip, onPickPlayer, onBack }: PlayerStepProps) {
  return (
    <>
      <BackLink onPress={onBack} />
      <SignTitle>{trip.name}</SignTitle>
      <Card seed={trip.trip_id}>
        {trip.players.map((player, index) => (
          <View key={player.id} style={styles.line}>
            {index > 0 ? <DashedRule /> : null}
            <PressableScale accessibilityRole="button" onPress={() => onPickPlayer(player)} style={styles.row}>
              <Avatar name={player.name} color={player.color} photoPath={player.photo_path} />
              <Text style={styles.name}>
                {player.name}
                {player.is_groom ? '  ★' : ''}
              </Text>
              {player.has_joined ? <Text style={styles.joined}>JOINED</Text> : null}
            </PressableScale>
          </View>
        ))}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  line: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 44 },
  name: { ...Type.name, flex: 1, fontSize: 20, lineHeight: 22 },
  joined: { fontFamily: Fonts.heavy, fontSize: 10, color: Paper.muted, letterSpacing: 1.4 },
});
