import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import type { haptics } from '@/components/haptics';
import { Icon, type IconName } from '@/components/icon';
import { Key } from '@/components/key';
import { PressableScale } from '@/components/pressable-scale';
import { Radius, Spacing, Type } from '@/constants/theme';
import { useGround } from '@/light-mode/light-mode-provider';
import { useSurfaceColors, type Surface } from '@/light-mode/surface';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  feedback?: keyof typeof haptics;
  icon?: IconName;
  // Secondary buttons draw in the colour of what they sit on; by default that's read from the nearest Card.
  surface?: Surface;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  feedback = 'tap',
  icon,
  surface,
}: ButtonProps) {
  const ground = useGround();
  const surfaceColors = useSurfaceColors(surface);
  const inactive = disabled || loading;
  const pressableProps = {
    accessibilityRole: 'button',
    accessibilityState: { disabled: inactive, busy: loading },
    onPress,
    disabled: inactive,
    feedback,
  } as const;

  if (variant === 'secondary') {
    const color = surfaceColors.text;
    return (
      <PressableScale
        {...pressableProps}
        style={[styles.secondary, { borderColor: color }, inactive && styles.inactive]}>
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={18} color={color} /> : null}
            <Text style={[styles.secondaryLabel, { color }]}>{title}</Text>
          </>
        )}
      </PressableScale>
    );
  }

  const key =
    variant === 'danger'
      ? { face: ground.decline, edge: ground.declineEdge, text: ground.onDecline }
      : { face: ground.primary, edge: ground.primaryEdge, text: ground.onPrimary };
  return (
    <Key {...pressableProps} face={key.face} edge={key.edge} style={inactive && styles.inactive}>
      {loading ? (
        <ActivityIndicator color={key.text} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={key.text} /> : null}
          <Text style={[Type.key, { color: key.text }]}>{title}</Text>
        </>
      )}
    </Key>
  );
}

const styles = StyleSheet.create({
  secondary: {
    minHeight: 50,
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.key,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
  },
  secondaryLabel: { ...Type.key, fontSize: 18 },
  inactive: { opacity: 0.4 },
});
