import { Colors } from '@/constants/theme';

const MINUS_SIGN = '−';

export function formatPoints(points: number) {
  if (points > 0) return `+${points}`;
  if (points < 0) return `${MINUS_SIGN}${Math.abs(points)}`;
  return '0';
}

export function pointsColor(points: number) {
  if (points > 0) return Colors.plus;
  if (points < 0) return Colors.minus;
  return Colors.muted;
}

export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

// A short, stable number to print at the top of an entry's receipt.
export function formatReceiptNumber(id: string) {
  return `#${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}
