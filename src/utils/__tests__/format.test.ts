import { Colors } from '@/constants/theme';
import { formatPoints, pluralize, pointsColor } from '@/utils/format';

describe('formatPoints', () => {
  it('uses a real minus sign for penalties', () => {
    expect(formatPoints(-5)).toBe('−5');
  });

  it('adds a plus sign to bonuses', () => {
    expect(formatPoints(10)).toBe('+10');
  });

  it('shows zero without a sign', () => {
    expect(formatPoints(0)).toBe('0');
  });
});

describe('pointsColor', () => {
  it.each([
    [-1, Colors.minus],
    [1, Colors.plus],
    [0, Colors.muted],
  ])('colors %i points', (points, color) => {
    expect(pointsColor(points)).toBe(color);
  });
});

describe('pluralize', () => {
  it('picks the singular form for one', () => {
    expect(pluralize(1, 'try', 'tries')).toBe('1 try');
  });

  it('picks the plural form otherwise', () => {
    expect(pluralize(0, 'try', 'tries')).toBe('0 tries');
    expect(pluralize(3, 'try', 'tries')).toBe('3 tries');
  });
});
