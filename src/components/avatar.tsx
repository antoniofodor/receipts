import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { avatarUrl } from '@/api/avatar-url';
import { Colors, Fonts } from '@/constants/theme';
import { initialsOf } from '@/utils/initials';

type AvatarProps = {
  name: string;
  color: string;
  photoPath?: string | null;
  size?: number;
};

// A register key with the player's initials, covered by their photo once it loads.
export function Avatar({ name, color, photoPath, size = 32 }: AvatarProps) {
  const radius = size * 0.25;
  return (
    <View style={[styles.key, { width: size, height: size, borderRadius: radius, backgroundColor: color }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
      {photoPath ? (
        <Image
          source={{ uri: avatarUrl(photoPath), cacheKey: photoPath }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  key: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { fontFamily: Fonts.heavy, color: Colors.onAccent },
});
