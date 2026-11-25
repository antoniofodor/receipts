import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { TextField } from '@/components/text-fields';
import { ErrorText, Label, MutedText } from '@/components/typography';
import type { useAccountCodeFlow } from '@/hooks/use-account-code-flow';
import { formatCountdown } from '@/utils/format';

type AccountEmailStepProps = {
  flow: ReturnType<typeof useAccountCodeFlow>;
  // Something the person could regret missing, like this phone leaving its trip.
  warning?: string | null;
};

export function AccountEmailStep({ flow, warning }: AccountEmailStepProps) {
  return (
    <Card seed="account-email">
      <Label>Email</Label>
      <TextField
        value={flow.email}
        onChangeText={flow.setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={() => flow.canSend && flow.send()}
        autoFocus
        accessibilityLabel="Email"
      />
      {warning ? <MutedText>{warning}</MutedText> : null}
      <ErrorText>{flow.error}</ErrorText>
      <Button
        title={flow.secondsUntilNewCode ? `Send code in ${formatCountdown(flow.secondsUntilNewCode)}` : 'Send code'}
        onPress={flow.send}
        loading={flow.busy}
        disabled={!flow.canSend}
      />
    </Card>
  );
}
