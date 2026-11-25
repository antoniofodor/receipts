import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { SignTitle } from '@/components/ground/sign-title';
import { MutedText } from '@/components/typography';

export function StartupError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen>
      <SignTitle>{"Couldn't connect"}</SignTitle>
      <MutedText>{message}</MutedText>
      <Button title="Try again" onPress={onRetry} />
    </Screen>
  );
}
