import { entryPointsRange, kindOfPoints, signedPoints } from '@/utils/points';

describe('signedPoints', () => {
  it('makes penalties negative and bonuses positive', () => {
    expect(signedPoints('penalty', 5)).toBe(-5);
    expect(signedPoints('bonus', 5)).toBe(5);
    expect(signedPoints('penalty', -5)).toBe(-5);
  });
});

describe('kindOfPoints', () => {
  it('reads the kind from the sign', () => {
    expect(kindOfPoints(-3)).toBe('penalty');
    expect(kindOfPoints(3)).toBe('bonus');
  });
});

describe('entryPointsRange', () => {
  it('keeps a penalty negative, up to the database limit of 50', () => {
    expect(entryPointsRange(-5)).toEqual({ min: -50, max: -1 });
  });

  it('keeps a bonus positive, up to the database limit of 50', () => {
    expect(entryPointsRange(10)).toEqual({ min: 1, max: 50 });
  });
});
