import { File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

import type { Photo } from '@/api/photos';

// iOS shares the image and the caption together, so a text chat shows both. Android's share sheet takes a file
// or text but not both, so it sends the image, which carries everything anyway.
export async function shareReceiptImage(imageUri: string, caption: string) {
  if (Platform.OS === 'ios') {
    await Share.share({ url: imageUri, message: caption });
    return;
  }
  await Sharing.shareAsync(imageUri, { mimeType: 'image/png', dialogTitle: 'Share receipt' });
}

export async function saveImageToPhotos(imageUri: string) {
  await allowSavingToPhotos();
  await Asset.create(imageUri);
}

// The originals, full size, without the receipt around them.
export async function saveOriginalPhotos(photos: Photo[]) {
  await allowSavingToPhotos();
  for (const photo of photos) {
    const download = await File.downloadFileAsync(photo.url, new File(Paths.cache, `receipt-${photo.id}.jpg`), {
      idempotent: true,
    });
    await Asset.create(download.uri);
  }
}

// Asks only to add to the library, never to read it.
async function allowSavingToPhotos() {
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('Receipts needs permission to add to your photos. You can allow it in Settings.');
  }
}
