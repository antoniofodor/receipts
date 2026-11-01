import { kindOfPoints, signedPoints } from '@/utils/points';

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
