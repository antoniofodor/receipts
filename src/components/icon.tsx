import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { Colors } from '@/constants/theme';

// SF Symbols on iOS, Material Symbols on Android: each icon is named once here for both.
const ICONS = {
  comment: { ios: 'bubble.left', android: 'chat_bubble' },
  confirmed: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  rejected: { ios: 'xmark.circle.fill', android: 'cancel' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  camera: { ios: 'camera.fill', android: 'photo_camera' },
} satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

export function Icon({ name, size = 18, color = Colors.ink, accessibilityLabel }: IconProps) {
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      tintColor={color}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
