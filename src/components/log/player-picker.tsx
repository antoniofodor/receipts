import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Player } from '@/api/players';
import { Avatar } from '@/components/avatar';
import { haptics } from '@/components/haptics';
import { Fonts, Paper, Radius, Spacing } from '@/constants/theme';

type PlayerPickerProps = {
  players: Player[];
  myPlayerId: string;
  selectedId: string | null;
  onSelect: (playerId: string) => void;
};

export function PlayerPicker({ players, myPlayerId, selectedId, onSelect }: PlayerPickerProps) {
  return (
    <View style={styles.grid}>
      {players.map((player) => {
        const selected = player.id === selectedId;
        const label = player.id === myPlayerId ? `${player.name} (you)` : player.name;
        return (
          <Pressable
            key={player.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => {
              haptics.tick();
              onSelect(player.id);
            }}
            style={[styles.option, selected && styles.selected]}>
            <Avatar name={player.name} color={player.color} photoPath={player.photo_path} size={44} />
            <Text style={[styles.name, selected && styles.selectedName]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  option: {
    width: '31%',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: { borderColor: Paper.ink, backgroundColor: Paper.highlight },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Paper.muted,
  },
  selectedName: { color: Paper.ink },
});
