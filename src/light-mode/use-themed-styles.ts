import { Ground, type GroundPalette } from '@/constants/theme';
import { useLightMode } from '@/light-mode/light-mode-provider';
import type { LightMode } from '@/utils/light-mode';

type StyleCache = Partial<Record<LightMode, unknown>>;
const stylesByMaker = new WeakMap<object, StyleCache>();

// Styles for things on the ground, built once per light and shared by every component using the same maker.
// Declare makeStyles at module scope: the cache is keyed by the function itself.
export function useThemedStyles<T>(makeStyles: (ground: GroundPalette) => T): T {
  const { mode } = useLightMode();
  let cache = stylesByMaker.get(makeStyles);
  if (!cache) {
    cache = {};
    stylesByMaker.set(makeStyles, cache);
  }
  cache[mode] ??= makeStyles(Ground[mode]);
  return cache[mode] as T;
}
