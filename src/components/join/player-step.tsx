import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PreviewPlayer, TripPreview } from '@/api/trips';
import { Avatar } from '@/components/avatar';
import { BackLink } from '@/components/back-link';
import { MutedText, Title } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type PlayerStepProps = {
  trip: TripPreview;
  onPickPlayer: (player: PreviewPlayer) => void;
  onBack: () => void;
};

export function PlayerStep({ trip, onPickPlayer, onBack }: PlayerStepProps) {
  return (
    <>
      <BackLink onPress={onBack} />
      <Title subtitle="Tap your name.">{trip.name}</Title>
      <View style={sharedStyles.stack}>
        {trip.players.map((player) => (
          <Pressable
            key={player.id}
            accessibilityRole="button"
            onPress={() => onPickPlayer(player)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Avatar name={player.name} color={player.color} />
            <Text style={styles.name}>
              {player.name}
              {player.is_groom ? '  ★' : ''}
            </Text>
            {player.has_joined ? <Text style={styles.joined}>JOINED</Text> : null}
          </Pressable>
        ))}
      </View>
      <MutedText>Already joined on another phone? Tap your name and enter the same PIN.</MutedText>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  pressed: { opacity: 0.7 },
  name: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.ink },
  joined: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.plus, letterSpacing: 1 },
});
