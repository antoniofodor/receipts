import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LocalPhoto } from '@/api/photos';
import { showActionSheet } from '@/components/action-sheet';
import { Button } from '@/components/button';
import { ErrorText, Label, MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { Colors, Radius, Spacing } from '@/constants/theme';
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
      <Label>Photos (optional)</Label>
      {photos.length > 0 ? (
        <View style={styles.thumbnails}>
          {photos.map((photo, index) => (
            <View key={photo.uri} style={styles.thumbnail}>
              <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${index + 1}`}
                onPress={() => onRemove(photo.uri)}
                hitSlop={8}
                style={styles.remove}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <MutedText>Receipts or it didn&apos;t happen. Up to 3.</MutedText>
      )}
      {photosLeft > 0 ? <Button title="Add photo" variant="secondary" onPress={addPhoto} loading={busy} /> : null}
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const THUMBNAIL_SIZE = 96;

const styles = StyleSheet.create({
  thumbnails: { flexDirection: 'row', gap: Spacing.sm },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.line,
  },
  remove: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: Colors.onAccent, fontSize: 16, fontWeight: '700', lineHeight: 18 },
});
