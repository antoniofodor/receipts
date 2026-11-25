import { crookedLetterIndex, signTileHeight, signWords } from '@/utils/sign-letters';

describe('sign letters', () => {
  it('spells the sign in capitals, one entry per word', () => {
    expect(signWords('  Join the   trip ')).toEqual(['JOIN', 'THE', 'TRIP']);
  });

  it('knocks the same letter crooked every time, and leaves single letters straight', () => {
    const index = crookedLetterIndex('FEED');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(4);
    expect(crookedLetterIndex('FEED')).toBe(index);
    expect(crookedLetterIndex('A')).toBe(-1);
  });

  it('keeps the preferred tile size when the longest word fits', () => {
    expect(signTileHeight(['FEED'], 40, 350)).toBe(40);
  });

  it('shrinks the tiles so a long word fits across the width', () => {
    const height = signTileHeight(['BACHELORETTEPARTY'], 40, 350);
    expect(height).toBeLessThan(40);
    expect(17 * (height * 0.55 + 2)).toBeLessThanOrEqual(350);
  });
});
