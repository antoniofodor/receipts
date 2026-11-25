// FNV-1a: a stable number from a piece of text, so decoration chosen from an id or a word never changes.
export function hashOf(text: string) {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

// Xorshift numbers in [0, 1) from a piece of text: the same text always gives the same sequence.
export function seededRandom(seed: string) {
  let state = hashOf(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
