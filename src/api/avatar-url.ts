// Profile photos sit in a public bucket, so their links are built here without a request (or the client).
const PUBLIC_AVATARS = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/`;

export function avatarUrl(path: string) {
  return PUBLIC_AVATARS + path.split('/').map(encodeURIComponent).join('/');
}
