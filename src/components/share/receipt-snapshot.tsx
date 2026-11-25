import { Image } from 'expo-image';
import { useEffect, type Ref } from 'react';
import { StyleSheet, Text, View, type HostInstance } from 'react-native';

import type { Entry } from '@/api/entries';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { FiledByBadge } from '@/components/feed/filed-by-badge';
import { StatusPill } from '@/components/feed/status-pill';
import { SignStrip } from '@/components/ground/sign-letters';
import { Barcode } from '@/components/receipt/barcode';
import { DashedRule } from '@/components/receipt/dashed-rule';
import { LineItem } from '@/components/receipt/line-item';
import { Stamp } from '@/components/receipt/stamp';
import { sharedStyles } from '@/constants/styles';
import { Fonts, Paper, Radius, Spacing, Type, Wear } from '@/constants/theme';
import { FixedLightMode } from '@/light-mode/light-mode-provider';
import { STATUS_LABELS } from '@/utils/entry-status';
import { formatPoints, formatReceiptNumber, pointsColor } from '@/utils/format';
import { feedPhotoAspectRatio } from '@/utils/photo-size';
import { formatReceiptDate } from '@/utils/receipt-date';

type ReceiptSnapshotProps = {
  entry: Entry;
  tripName: string;
  ref?: Ref<HostInstance>;
  // Called once there's nothing left to load, so the picture is never taken half-drawn.
  onReady: () => void;
};

// The post as one self-contained receipt, drawn to be turned into a picture and sent outside the app.
export function ReceiptSnapshot({ entry, tripName, ref, onReady }: ReceiptSnapshotProps) {
  const [photo] = entry.photos;

  useEffect(() => {
    if (!photo) onReady();
  }, [photo, onReady]);

  return (
    // Always the daytime counter and shadows, so a shared picture looks the same at any hour.
    <FixedLightMode mode="day">
      <View ref={ref} collapsable={false} style={styles.counter}>
        <Card seed={entry.id} wear="none">
          <View style={styles.store}>
            <SignStrip text="Receipts" height={22} />
            <Text style={styles.storeLine}>{tripName}</Text>
            <Text style={styles.storeLine}>
              TXN {formatReceiptNumber(entry.id)} · {formatReceiptDate(new Date(entry.created_at))}
            </Text>
          </View>
          <DashedRule />
          <View style={sharedStyles.row}>
            <Avatar name={entry.subject.name} color={entry.subject.color} photoPath={entry.subject.photo_path} />
            <View style={styles.byline}>
              <Text style={Type.name}>{entry.subject.name}</Text>
              <View style={styles.tags}>
                <StatusPill status={entry.status} />
                <FiledByBadge filer={entry.filer} isSelfClaim={entry.filer.id === entry.subject.id} />
              </View>
            </View>
          </View>
          <LineItem
            label={entry.rule.title}
            value={
              <Text style={[Type.points, { color: pointsColor(entry.points) }]}>{formatPoints(entry.points)}</Text>
            }
          />
          {entry.note ? <Text style={Type.body}>{entry.note}</Text> : null}
          {photo ? (
            <Image
              source={{ uri: photo.url, cacheKey: photo.path }}
              style={[styles.photo, { aspectRatio: feedPhotoAspectRatio(photo.width, photo.height) }]}
              contentFit="cover"
              onLoad={onReady}
              onError={onReady}
            />
          ) : null}
          <DashedRule />
          <Text style={styles.footer}>*** Sent from Receipts ***</Text>
          <Barcode seed={entry.id} />
          {entry.status === 'pending' ? null : <Stamp label={STATUS_LABELS[entry.status].toUpperCase()} still />}
        </Card>
      </View>
    </FixedLightMode>
  );
}

const styles = StyleSheet.create({
  counter: { backgroundColor: Wear.counter, padding: Spacing.lg, borderRadius: Radius.lg },
  store: { alignItems: 'center', gap: 2 },
  storeLine: {
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: Paper.muted,
  },
  byline: { flex: 1, gap: Spacing.xs },
  tags: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  photo: { width: '100%', borderRadius: Radius.md, backgroundColor: Paper.rule },
  footer: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: Paper.muted,
  },
});
