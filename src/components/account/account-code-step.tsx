import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { DigitBoxesField } from '@/components/text-fields';
import { ErrorText, Label } from '@/components/typography';
import { Fonts, Paper, Spacing } from '@/constants/theme';
import { ACCOUNT_CODE_LENGTH, type useAccountCodeFlow } from '@/hooks/use-account-code-flow';
import { formatCountdown } from '@/utils/format';

type AccountCodeStepProps = {
  flow: ReturnType<typeof useAccountCodeFlow>;
  confirmTitle: string;
};

// The code confirms itself once the last digit is in; the button is there for a code pasted in a hurry.
export function AccountCodeStep({ flow, confirmTitle }: AccountCodeStepProps) {
  return (
    <Card seed="account-code">
      <Label>Code sent to {flow.sentTo}</Label>
      <DigitBoxesField
        length={ACCOUNT_CODE_LENGTH}
        value={flow.code}
        onChangeText={flow.setCode}
        onComplete={flow.confirm}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        accessibilityLabel="Code"
      />
      <ErrorText>{flow.error}</ErrorText>
      <Button
        title={confirmTitle}
        onPress={() => flow.confirm()}
        loading={flow.busy}
        disabled={flow.code.length !== ACCOUNT_CODE_LENGTH}
      />
      <View style={styles.links}>
        <TextLink
          label={
            flow.secondsUntilNewCode ? `New code in ${formatCountdown(flow.secondsUntilNewCode)}` : 'Send a new code'
          }
          onPress={flow.send}
          disabled={flow.busy || flow.secondsUntilNewCode > 0}
        />
        <TextLink label="Use a different email" onPress={flow.changeEmail} disabled={flow.busy} />
      </View>
    </Card>
  );
}

function TextLink({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  links: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  link: { minHeight: 44, justifyContent: 'center' },
  pressed: { opacity: 0.5 },
  linkText: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Paper.red },
});
