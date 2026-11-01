import { useCallback, useRef, useState } from 'react';
import { View, type HostInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import type { Entry } from '@/api/entries';
import { Button } from '@/components/button';
import { haptics } from '@/components/haptics';
import { ReceiptSnapshot } from '@/components/share/receipt-snapshot';
import { saveImageToPhotos, saveOriginalPhotos, shareReceiptImage } from '@/components/share/share-actions';
import { ErrorText, MutedText } from '@/components/typography';
import { sharedStyles } from '@/constants/styles';
import { useAsyncAction } from '@/hooks/use-async-action';
import { pluralize } from '@/utils/format';
import { shareCaption } from '@/utils/share-caption';

// Shows exactly what will leave the trip, then shares or saves that picture.
export function ShareReceiptPanel({ entry, tripName }: { entry: Entry; tripName: string }) {
  const snapshot = useRef<HostInstance>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const { busy, error, run } = useAsyncAction();
  const markReady = useCallback(() => setReady(true), []);

  const takePicture = () => captureRef(snapshot, { format: 'png', quality: 1, result: 'tmpfile' });

  function act(action: () => Promise<string | null>) {
    setSaved(null);
    run(async () => {
      const done = await action();
      if (done) {
        haptics.success();
        setSaved(done);
      }
    });
  }

  return (
    <>
      <ReceiptSnapshot ref={snapshot} entry={entry} tripName={tripName} onReady={markReady} />
      <View style={sharedStyles.stack}>
        <Button
          title="Share"
          onPress={() =>
            act(async () => {
              await shareReceiptImage(await takePicture(), shareCaption(entry, tripName));
              return null;
            })
          }
          disabled={!ready}
          loading={busy}
        />
        <Button
          title="Save receipt to Photos"
          variant="secondary"
          onPress={() =>
            act(async () => {
              await saveImageToPhotos(await takePicture());
              return 'Saved the receipt to your photos.';
            })
          }
          disabled={!ready || busy}
        />
        {entry.photos.length > 0 ? (
          <Button
            title={entry.photos.length > 1 ? 'Save original photos' : 'Save original photo'}
            variant="secondary"
            onPress={() =>
              act(async () => {
                await saveOriginalPhotos(entry.photos);
                return `Saved ${pluralize(entry.photos.length, 'photo', 'photos')} to your photos.`;
              })
            }
            disabled={busy}
          />
        ) : null}
        {saved ? <MutedText>{saved}</MutedText> : null}
        <ErrorText>{error}</ErrorText>
      </View>
    </>
  );
}
