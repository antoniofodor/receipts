import { StyleSheet } from 'react-native';

import type { EntryStatus } from '@/api/entries';
import { Tag } from '@/components/tag';
import { Colors } from '@/constants/theme';
import { STATUS_LABELS } from '@/utils/entry-status';

const LABEL_COLORS: Record<EntryStatus, string> = {
  pending: Colors.muted,
  confirmed: Colors.onAccent,
  rejected: Colors.red,
};

export function StatusPill({ status }: { status: EntryStatus }) {
  return <Tag label={STATUS_LABELS[status]} color={LABEL_COLORS[status]} style={styles[status]} />;
}

const styles = StyleSheet.create({
  pending: { borderStyle: 'dashed' },
  confirmed: { borderColor: Colors.ink, backgroundColor: Colors.ink },
  rejected: { borderColor: Colors.red },
});
