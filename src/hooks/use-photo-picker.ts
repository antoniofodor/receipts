import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { LocalPhoto } from '@/api/photos';
import { PHOTO_JPEG_QUALITY, resizeToFit } from '@/utils/photo-size';

// Shrunk on the phone so uploads are quick on trip-grade signal: a 12 MP photo becomes a few hundred KB.
async function compressPhoto(uri: string): Promise<LocalPhoto> {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const resize = resizeToFit(original.width, original.height);
  const image = resize ? await ImageManipulator.manipulate(original).resize(resize).renderAsync() : original;
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: PHOTO_JPEG_QUALITY });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

async function compressPicked(result: ImagePicker.ImagePickerResult) {
  if (result.canceled) return [];
  return Promise.all(result.assets.map((asset) => compressPhoto(asset.uri)));
}

export function usePhotoPicker() {
  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Receipts needs camera access to take photos. You can allow it in Settings.');
    }
    return compressPicked(await ImagePicker.launchCameraAsync({ mediaTypes: 'images' }));
  }

  async function choosePhotos(limit: number) {
    return compressPicked(
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: limit,
        orderedSelection: true,
      }),
    );
  }

  return { takePhoto, choosePhotos };
}
