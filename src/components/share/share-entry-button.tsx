import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { haptics } from '@/components/haptics';
import { Icon } from '@/components/icon';
import { Colors } from '@/constants/theme';

export function ShareEntryButton({ entryId, color = Colors.muted }: { entryId: string; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Share"
      onPress={() => {
        haptics.tap();
        router.push({ pathname: '/share/[id]', params: { id: entryId } });
      }}
      hitSlop={12}
      style={({ pressed }) => pressed && styles.pressed}>
      <Icon name="share" color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.5 },
});
