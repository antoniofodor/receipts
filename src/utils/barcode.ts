import { hashOf, seededRandom } from '@/utils/seed';

const BAR_COUNT = 56;

export type BarcodeBar = { width: number; gap: number };

// The same seed always gives the same bars.
export function barcodeBars(seed: string): BarcodeBar[] {
  const next = seededRandom(seed);
  return Array.from({ length: BAR_COUNT }, () => {
    const roll = next();
    return { width: roll < 0.3 ? 3 : roll < 0.6 ? 2 : 1, gap: next() < 0.5 ? 1 : 2 };
  });
}

// The digits printed under a barcode: the seed's hash, grouped in fours.
export function barcodeCaption(seed: string) {
  return String(hashOf(seed))
    .padStart(10, '0')
    .slice(0, 8)
    .replace(/(\d{4})(\d{4})/, '$1 $2');
}
