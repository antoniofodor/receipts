import { hashOf } from '@/utils/seed';

export const TILE_WIDTH_RATIO = 0.55;
export const TILE_GAP = 2;

export function signWords(text: string) {
  return text.toUpperCase().split(/\s+/).filter(Boolean);
}

// One letter per word has been knocked crooked; picked from the word so it's the same every time.
export function crookedLetterIndex(word: string) {
  return word.length < 2 ? -1 : hashOf(word) % word.length;
}

// Shrinks the tiles when the longest word wouldn't fit across the width, so a sign never runs off screen.
export function signTileHeight(words: string[], preferredHeight: number, availableWidth: number) {
  const longest = Math.max(1, ...words.map((word) => word.length));
  const fittingHeight = (availableWidth / longest - TILE_GAP) / TILE_WIDTH_RATIO;
  return Math.min(preferredHeight, Math.floor(fittingHeight));
}
