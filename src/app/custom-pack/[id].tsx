import { router, useLocalSearchParams } from 'expo-router';

import { BackLink } from '@/components/back-link';
import { CustomPackEditor } from '@/components/custom-packs/custom-pack-editor';
import { SignTitle } from '@/components/ground/sign-title';
import { Screen } from '@/components/screen';
import { ErrorText, MutedText } from '@/components/typography';
import { useCustomPacks } from '@/hooks/use-custom-packs';

export default function CustomPackScreen() {
  const { id: packId } = useLocalSearchParams<{ id: string }>();
  const { packs, error } = useCustomPacks();
  const pack = packs?.find((each) => each.id === packId);

  return (
    <Screen>
      <BackLink label="Close" onPress={() => router.back()} />
      <SignTitle tileHeight={32}>{pack?.name ?? 'Rule pack'}</SignTitle>
      <ErrorText>{error}</ErrorText>
      {packs && !pack ? <MutedText>This pack isn&apos;t here anymore.</MutedText> : null}
      {pack ? <CustomPackEditor pack={pack} onDeleted={() => router.back()} /> : null}
    </Screen>
  );
}
