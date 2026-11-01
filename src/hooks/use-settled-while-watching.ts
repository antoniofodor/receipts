import { useState } from 'react';

import type { EntryStatus } from '@/api/entries';

// The result an entry was voted to while this screen showed it, so the stamp only lands when you see it happen.
export function useSettledWhileWatching(status: EntryStatus) {
  const [previous, setPrevious] = useState(status);
  const [settled, setSettled] = useState<EntryStatus | null>(null);
  if (status !== previous) {
    setPrevious(status);
    setSettled(previous === 'pending' && status !== 'pending' ? status : null);
  }
  return settled;
}
