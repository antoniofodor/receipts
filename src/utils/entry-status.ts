import type { EntryStatus } from '@/api/entries';

// Worded like a card terminal.
export const STATUS_LABELS: Record<EntryStatus, string> = {
  pending: 'Pending',
  confirmed: 'Approved',
  rejected: 'Declined',
};
