import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { MutedText, Title } from '@/components/typography';

export function StartupError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen>
      <Title>Couldn&apos;t connect</Title>
      <MutedText>{message}</MutedText>
      <Button title="Try again" onPress={onRetry} />
    </Screen>
  );
}
