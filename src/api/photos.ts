import { File } from 'expo-file-system';

import { toUserMessage, unwrap } from '@/api/request';
import { supabase } from '@/api/supabase-client';

const BUCKET = 'evidence';
// Lists refetch far more often than this, so a fresh link is always on hand; a leaked link dies within the hour.
const PHOTO_LINK_LIFETIME_SECONDS = 60 * 60;

export type LocalPhoto = { uri: string; width: number; height: number };

export type UploadedPhoto = { path: string; width: number; height: number };

export type Photo = { id: string; path: string; width: number; height: number; url: string };

export type StoredPhoto = { id: string; storage_path: string; width: number | null; height: number | null };

// The database only accepts photos stored under <trip>/<entry>/, which is how it knows whose they are.
export async function uploadEntryPhoto(tripId: string, entryId: string, photo: LocalPhoto, fileName: string) {
  const path = `${tripId}/${entryId}/${fileName}.jpg`;
  const bytes = await new File(photo.uri).arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg' });
  if (error) throw new Error(toUserMessage(error.message));
  return { path, width: photo.width, height: photo.height } satisfies UploadedPhoto;
}

// One request signs every photo in a list.
export async function photoLinks(paths: string[]) {
  if (paths.length === 0) return new Map<string, string>();
  const signed = unwrap<{ path: string | null; signedUrl: string | null }[]>(
    await supabase.storage.from(BUCKET).createSignedUrls(paths, PHOTO_LINK_LIFETIME_SECONDS),
  );
  return new Map(signed.flatMap(({ path, signedUrl }) => (path && signedUrl ? [[path, signedUrl] as const] : [])));
}

export function toPhotos(stored: StoredPhoto[], links: Map<string, string>): Photo[] {
  return stored.flatMap((photo) => {
    const url = links.get(photo.storage_path);
    if (!url) return [];
    return [{ id: photo.id, path: photo.storage_path, width: photo.width ?? 1, height: photo.height ?? 1, url }];
  });
}
