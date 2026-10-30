import type { JoinResult } from '@/api/trips';
import { pluralize } from '@/utils/format';

export function describeFailedJoin(result: Exclude<JoinResult, { ok: true }>, playerName: string) {
  if (result.error === 'locked') {
    const minutes = Math.ceil(result.retry_after_seconds / 60);
    return `Too many wrong PINs. ${playerName} is locked for ${minutes} min. Ask the organiser if you've forgotten it.`;
  }
  return `Wrong PIN. ${pluralize(result.attempts_left, 'try', 'tries')} left.`;
}
