import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/icon';
import { Type, type GroundPalette } from '@/constants/theme';
import { useGround } from '@/light-mode/light-mode-provider';
import { useThemedStyles } from '@/light-mode/use-themed-styles';

export function BackLink({ onPress, label = 'Back' }: { onPress: () => void; label?: string }) {
  const styles = useThemedStyles(makeStyles);
  const ground = useGround();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Icon name="back" size={18} color={ground.text} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (ground: GroundPalette) =>
  StyleSheet.create({
    link: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2, minHeight: 44 },
    pressed: { opacity: 0.5 },
    text: { ...Type.backLink, color: ground.text },
  });
