import type { Entry } from '@/api/entries';
import { STATUS_LABELS } from '@/utils/entry-status';
import { formatPoints } from '@/utils/format';

// The text sent alongside the receipt image, for chats that show it under the picture.
export function shareCaption(entry: Entry, tripName: string) {
  const isSelfClaim = entry.filer.id === entry.subject.id;
  const who = isSelfClaim ? `claimed by ${entry.subject.name}` : `logged by ${entry.filer.name}`;
  return [
    `${entry.subject.name}: ${entry.rule.title} (${formatPoints(entry.points)}) · ${STATUS_LABELS[entry.status]}`,
    `${who.charAt(0).toUpperCase()}${who.slice(1)} on ${tripName}. Sent from Receipts.`,
  ].join('\n');
}
