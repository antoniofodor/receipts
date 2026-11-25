import type { EntryStatus } from '@/api/entries';
import { Tag, type TagKind } from '@/components/tag';
import { STATUS_LABELS } from '@/utils/entry-status';

const TAG_KINDS: Record<EntryStatus, TagKind> = {
  pending: 'pending',
  confirmed: 'approved',
  rejected: 'declined',
};

export function StatusPill({ status }: { status: EntryStatus }) {
  return <Tag label={STATUS_LABELS[status]} kind={TAG_KINDS[status]} />;
}
