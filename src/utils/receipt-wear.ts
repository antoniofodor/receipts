import { seededRandom } from '@/utils/seed';

// full: every receipt in the app. none: the shared picture, kept clean.
export type WearLevel = 'full' | 'none';

export type ReceiptWear = {
  taped: boolean;
  // Where across the receipt the fold crease runs, as a percentage of its width.
  creaseAt: number | null;
};

export const NO_WEAR: ReceiptWear = { taped: false, creaseAt: null };

// Picked from the receipt's id, so a receipt looks the same every time it's drawn and never jumps.
// Receipts aren't tilted: iOS draws the edges of a view turned by a fraction of a degree as stair-steps.
export function receiptWear(seed: string, level: WearLevel): ReceiptWear {
  if (level === 'none') return NO_WEAR;
  const next = seededRandom(seed);
  return { taped: next() < 0.5, creaseAt: Math.round(35 + next() * 30) };
}
