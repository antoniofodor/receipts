const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(isoDate: string, now: Date = new Date()) {
  const elapsed = now.getTime() - new Date(isoDate).getTime();
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  return `${Math.floor(elapsed / DAY)}d ago`;
}
