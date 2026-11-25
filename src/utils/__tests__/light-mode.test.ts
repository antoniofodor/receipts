import { isLightPreference, lightModeAt, nextLightChange, nextLightLabel } from '@/utils/light-mode';

const at = (hour: number, minute = 0, day = 24, month = 10) => new Date(2026, month, day, hour, minute);

describe('lightModeAt', () => {
  it.each([
    [at(0, 0), 'night'],
    [at(5, 59), 'night'],
    [at(6, 0), 'day'],
    [at(12, 0), 'day'],
    [at(18, 59), 'day'],
    [at(19, 0), 'night'],
    [at(23, 59), 'night'],
  ])('follows the clock on auto at %s', (date, mode) => {
    expect(lightModeAt(date, 'auto')).toBe(mode);
  });

  it('keeps a fixed preference whatever the time', () => {
    expect(lightModeAt(at(3, 0), 'day')).toBe('day');
    expect(lightModeAt(at(12, 0), 'night')).toBe('night');
  });
});

describe('nextLightChange', () => {
  it.each([
    [at(0, 0), at(6, 0)],
    [at(5, 59), at(6, 0)],
    [at(6, 0), at(19, 0)],
    [at(18, 59), at(19, 0)],
    [at(19, 0), at(6, 0, 25)],
    [at(23, 30), at(6, 0, 25)],
  ])('after %s comes %s', (date, change) => {
    expect(nextLightChange(date)).toEqual(change);
  });

  it('rolls over the end of the month and the year', () => {
    expect(nextLightChange(new Date(2026, 10, 30, 20))).toEqual(new Date(2026, 11, 1, 6));
    expect(nextLightChange(new Date(2026, 11, 31, 22))).toEqual(new Date(2027, 0, 1, 6));
  });
});

describe('isLightPreference', () => {
  it('accepts only the three preferences', () => {
    expect(['auto', 'day', 'night'].every(isLightPreference)).toBe(true);
    expect([null, 'dusk', 1].some(isLightPreference)).toBe(false);
  });
});

describe('nextLightLabel', () => {
  it('says when the light next changes', () => {
    expect(nextLightLabel('day')).toBe('Night from 7pm');
    expect(nextLightLabel('night')).toBe('Day from 6am');
  });
});
