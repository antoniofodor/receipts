import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { LocalPhoto } from '@/api/photos';
import { showActionSheet } from '@/components/action-sheet';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ErrorText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Spacing, Type } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';
import { usePhotoPicker } from '@/hooks/use-photo-picker';

type PhotoPickerFieldProps = {
  photos: LocalPhoto[];
  photosLeft: number;
  onAdd: (photos: LocalPhoto[]) => void;
  onRemove: (uri: string) => void;
};

const PHOTO_SOURCES = [
  { label: 'Take photo', value: 'camera' },
  { label: 'Choose from library', value: 'library' },
] as const;

export function PhotoPickerField({ photos, photosLeft, onAdd, onRemove }: PhotoPickerFieldProps) {
  const picker = usePhotoPicker();
  const { busy, error, run } = useAsyncAction();

  function addPhoto() {
    run(async () => {
      const source = await showActionSheet('Add a photo', [...PHOTO_SOURCES]);
      if (source === null) return;
      onAdd(source === 'camera' ? await picker.takePhoto() : await picker.choosePhotos(photosLeft));
    });
  }

  return (
    <View style={sharedStyles.stack}>
      <View style={styles.thumbnails}>
        {photos.map((photo, index) => (
          <View key={photo.uri} style={styles.thumbnail}>
            <Image source={{ uri: photo.uri }} style={styles.image} contentFit="cover" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
              onPress={() => onRemove(photo.uri)}
              hitSlop={10}
              style={styles.remove}>
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
        ))}
        {photosLeft > 0 ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            onPress={addPhoto}
            style={[styles.thumbnail, styles.addTile]}>
            {busy ? (
              <ActivityIndicator color={Paper.ink} />
            ) : (
              <>
                <Icon name="camera" size={22} color={Paper.ink} />
                <Text style={styles.addText}>Add</Text>
              </>
            )}
          </PressableScale>
        ) : null}
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const THUMBNAIL_SIZE = 88;
const REMOVE_SIZE = 24;

const styles = StyleSheet.create({
  thumbnails: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  thumbnail: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE },
  image: { ...StyleSheet.absoluteFill, backgroundColor: Paper.rule },
  remove: {
    position: 'absolute',
    top: -REMOVE_SIZE / 3,
    right: -REMOVE_SIZE / 3,
    width: REMOVE_SIZE,
    height: REMOVE_SIZE,
    borderRadius: REMOVE_SIZE / 2,
    backgroundColor: Paper.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontFamily: Fonts.bold, color: Paper.paper, fontSize: 15, lineHeight: 18 },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Paper.ink,
  },
  addText: { ...Type.key, fontSize: 14, color: Paper.ink },
});
