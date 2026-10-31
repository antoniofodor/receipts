import { formatRelativeTime } from '@/utils/relative-time';

const now = new Date('2026-10-30T21:00:00Z');
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

describe('formatRelativeTime', () => {
  it.each([
    [30_000, 'just now'],
    [5 * 60_000, '5m ago'],
    [3 * 3_600_000, '3h ago'],
    [2 * 86_400_000, '2d ago'],
  ])('formats %i ms ago as %s', (elapsed, expected) => {
    expect(formatRelativeTime(ago(elapsed), now)).toBe(expected);
  });
});
