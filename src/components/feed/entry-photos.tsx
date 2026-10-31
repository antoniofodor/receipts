import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Photo } from '@/api/photos';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { feedPhotoAspectRatio } from '@/utils/photo-size';

type EntryPhotosProps = {
  photos: Photo[];
  layout: 'strip' | 'full';
  onPress?: () => void;
};

// Links to photos expire and are re-signed on every fetch; caching by storage path keeps one download per photo.
function photoSource(photo: Photo) {
  return { uri: photo.url, cacheKey: photo.path };
}

export function EntryPhotos({ photos, layout, onPress }: EntryPhotosProps) {
  if (photos.length === 0) return null;

  if (layout === 'full') {
    return (
      <View style={styles.fullStack}>
        {photos.map((photo, index) => (
          <Image
            key={photo.id}
            source={photoSource(photo)}
            style={[styles.photo, { aspectRatio: photo.width / photo.height }]}
            contentFit="contain"
            transition={150}
            accessibilityLabel={`Photo ${index + 1} of ${photos.length}`}
          />
        ))}
      </View>
    );
  }

  const [only] = photos;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Open photos" onPress={onPress} disabled={!onPress}>
      {photos.length === 1 ? (
        <Image
          source={photoSource(only)}
          style={[styles.photo, { aspectRatio: feedPhotoAspectRatio(only.width, only.height) }]}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={styles.strip}>
          {photos.map((photo) => (
            <Image
              key={photo.id}
              source={photoSource(photo)}
              style={[styles.photo, styles.square]}
              contentFit="cover"
              transition={150}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', borderRadius: Radius.md, backgroundColor: Colors.line },
  strip: { flexDirection: 'row', gap: Spacing.xs },
  square: { flex: 1, width: undefined, aspectRatio: 1 },
  fullStack: { gap: Spacing.sm },
});
