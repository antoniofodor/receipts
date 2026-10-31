import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Player } from '@/api/players';
import { Avatar } from '@/components/avatar';
import { Colors, Radius, Spacing } from '@/constants/theme';

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
            onPress={() => onSelect(player.id)}
            style={[styles.option, selected && styles.selected]}>
            <Avatar name={player.name} color={player.color} size={40} />
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
    width: 84,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: { borderColor: Colors.accent, backgroundColor: Colors.card },
  name: { fontSize: 12, fontWeight: '600', color: Colors.muted, maxWidth: 76 },
  selectedName: { color: Colors.ink },
});
