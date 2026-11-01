import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';

import type { LocalPhoto } from '@/api/photos';
import { callFunction, toUserMessage } from '@/api/request';
import { supabase } from '@/api/supabase-client';

const BUCKET = 'avatars';

// Each photo gets a new name, so phones never show a cached copy of the old one. Returns where it's stored.
export async function setMyPhoto(tripId: string, playerId: string, photo: LocalPhoto) {
  const path = `${tripId}/${playerId}/${randomUUID()}.jpg`;
  const bytes = await new File(photo.uri).arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg' });
  if (error) throw new Error(toUserMessage(error.message));
  await removeReplacedPhoto(
    await callFunction<string | null>('set_my_photo', { p_trip_id: tripId, p_photo_path: path }),
  );
  return path;
}

export async function removeMyPhoto(tripId: string) {
  await removeReplacedPhoto(
    await callFunction<string | null>('set_my_photo', { p_trip_id: tripId, p_photo_path: null }),
  );
}

// The photo is already swapped by now, so a file left behind is only clutter, never something anyone sees.
async function removeReplacedPhoto(path: string | null) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}
