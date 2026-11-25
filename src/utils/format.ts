import { Paper } from '@/constants/theme';

export const MINUS_SIGN = '−';

export function formatPoints(points: number) {
  if (points > 0) return `+${points}`;
  if (points < 0) return `${MINUS_SIGN}${Math.abs(points)}`;
  return '0';
}

export function pointsColor(points: number) {
  if (points > 0) return Paper.ink;
  if (points < 0) return Paper.red;
  return Paper.muted;
}

export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

// A short, stable number to print at the top of an entry's receipt.
export function formatReceiptNumber(id: string) {
  return `#${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
