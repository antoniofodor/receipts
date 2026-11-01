import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { LocalPhoto } from '@/api/photos';
import { PHOTO_JPEG_QUALITY, PHOTO_MAX_EDGE, PROFILE_PHOTO_EDGE, resizeToFit } from '@/utils/photo-size';

// Shrunk on the phone so uploads are quick on trip-grade signal: a 12 MP photo becomes a few hundred KB.
async function compressPhoto(uri: string, maxEdge: number): Promise<LocalPhoto> {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const resize = resizeToFit(original.width, original.height, maxEdge);
  const image = resize ? await ImageManipulator.manipulate(original).resize(resize).renderAsync() : original;
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: PHOTO_JPEG_QUALITY });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

async function compressPicked(result: ImagePicker.ImagePickerResult, maxEdge = PHOTO_MAX_EDGE) {
  if (result.canceled) return [];
  return Promise.all(result.assets.map((asset) => compressPhoto(asset.uri, maxEdge)));
}

async function requestCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Receipts needs camera access to take photos. You can allow it in Settings.');
  }
}

// A profile photo is cropped square by the phone's own editor, then kept small.
const PROFILE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  allowsEditing: true,
  aspect: [1, 1],
};

export function usePhotoPicker() {
  async function takePhoto() {
    await requestCamera();
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

  async function takeProfilePhoto() {
    await requestCamera();
    const [photo] = await compressPicked(
      await ImagePicker.launchCameraAsync({ ...PROFILE_PICKER_OPTIONS, cameraType: ImagePicker.CameraType.front }),
      PROFILE_PHOTO_EDGE,
    );
    return photo ?? null;
  }

  async function chooseProfilePhoto() {
    const [photo] = await compressPicked(
      await ImagePicker.launchImageLibraryAsync(PROFILE_PICKER_OPTIONS),
      PROFILE_PHOTO_EDGE,
    );
    return photo ?? null;
  }

  return { takePhoto, choosePhotos, takeProfilePhoto, chooseProfilePhoto };
}
