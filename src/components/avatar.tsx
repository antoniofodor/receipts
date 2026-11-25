import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { avatarUrl } from '@/api/avatar-url';
import { Fonts, Paper } from '@/constants/theme';
import { initialsOf } from '@/utils/initials';

const RING = 2;

type AvatarProps = {
  name: string;
  color: string;
  photoPath?: string | null;
  size?: number;
  // Square, for a photo print instead of a badge.
  square?: boolean;
};

// A round badge in the player's colour with their initials, covered by their photo once it loads.
export function Avatar({ name, color, photoPath, size = 32, square = false }: AvatarProps) {
  const ring = size < 20 ? 1 : RING;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: square ? 0 : size / 2,
          borderWidth: square ? 0 : ring,
          backgroundColor: color,
        },
      ]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initialsOf(name)}</Text>
      {photoPath ? (
        <Image
          source={{ uri: avatarUrl(photoPath), cacheKey: photoPath }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderColor: Paper.ink },
  initials: { fontFamily: Fonts.display, color: Paper.ink, includeFontPadding: false },
});
