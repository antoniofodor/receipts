export const PHOTO_MAX_EDGE = 1600;
export const PHOTO_JPEG_QUALITY = 0.7;
export const MAX_PHOTOS_PER_ENTRY = 3;

type Resize = { width: number; height: null } | { width: null; height: number };

// Scales the longer edge down to the limit and lets the other follow, so the shape never changes.
export function resizeToFit(width: number, height: number, maxEdge = PHOTO_MAX_EDGE): Resize | null {
  if (Math.max(width, height) <= maxEdge) return null;
  return width >= height ? { width: maxEdge, height: null } : { width: null, height: maxEdge };
}

// Clamped so a panorama or a screenshot doesn't take over the feed.
export function feedPhotoAspectRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) return 1;
  return Math.min(Math.max(width / height, 3 / 4), 16 / 9);
}
