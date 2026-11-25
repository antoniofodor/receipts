import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { haptics } from '@/components/haptics';
import { Icon } from '@/components/icon';
import { Paper } from '@/constants/theme';

export function ShareEntryButton({ entryId, color = Paper.muted }: { entryId: string; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Share"
      onPress={() => {
        haptics.tap();
        router.push({ pathname: '/share/[id]', params: { id: entryId } });
      }}
      hitSlop={12}
      style={({ pressed }) => [styles.target, pressed && styles.pressed]}>
      <Icon name="share" color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.5 },
});
