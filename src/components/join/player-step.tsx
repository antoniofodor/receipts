import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PreviewPlayer, TripPreview } from '@/api/trips';
import { Avatar } from '@/components/avatar';
import { BackLink } from '@/components/back-link';
import { Title } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Fonts, Radius, Spacing, Type } from '@/constants/theme';

type PlayerStepProps = {
  trip: TripPreview;
  onPickPlayer: (player: PreviewPlayer) => void;
  onBack: () => void;
};

export function PlayerStep({ trip, onPickPlayer, onBack }: PlayerStepProps) {
  return (
    <>
      <BackLink onPress={onBack} />
      <Title>{trip.name}</Title>
      <View style={sharedStyles.stack}>
        {trip.players.map((player) => (
          <Pressable
            key={player.id}
            accessibilityRole="button"
            onPress={() => onPickPlayer(player)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Avatar name={player.name} color={player.color} photoPath={player.photo_path} />
            <Text style={styles.name}>
              {player.name}
              {player.is_groom ? '  ★' : ''}
            </Text>
            {player.has_joined ? <Text style={styles.joined}>JOINED</Text> : null}
          </Pressable>
        ))}
      </View>
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
  name: { ...Type.name, flex: 1, fontSize: 15 },
  joined: { fontFamily: Fonts.bold, fontSize: 10.5, color: Colors.muted, letterSpacing: 1.4 },
});
