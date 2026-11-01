const BAR_COUNT = 56;

export type BarcodeBar = { width: number; gap: number };

function hashOf(text: string) {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

// A small deterministic generator, so the same seed always gives the same bars.
export function barcodeBars(seed: string): BarcodeBar[] {
  let state = hashOf(seed) || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
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
