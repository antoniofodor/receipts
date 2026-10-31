import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

type Identified = { id: string };

// Items that drop out of a list stay on screen until the user leaves it, so acting on one never makes it jump away.
// newerCopies is where a kept item lives on (the full feed); an item missing from both lists is gone, and goes.
export function useKeptWhileFocused<T extends Identified>(
  items: T[] | null,
  newerCopies: T[] | null,
  compare: (a: T, b: T) => number,
) {
  const [kept, setKept] = useState<T[]>([]);
  const release = useCallback(() => setKept([]), []);
  useFocusEffect(useCallback(() => release, [release]));

  const current = items ?? [];
  const latestById = new Map([...(newerCopies ?? []), ...current].map((item) => [item.id, item]));
  const keptIds = new Set(kept.map((item) => item.id));
  const merged = [
    ...kept.flatMap((item) => latestById.get(item.id) ?? []),
    ...current.filter((item) => !keptIds.has(item.id)),
  ].sort(compare);

  const changed = merged.length !== kept.length || merged.some((item, index) => item !== kept[index]);
  if (changed) setKept(merged);

  return { items: merged, release };
}
