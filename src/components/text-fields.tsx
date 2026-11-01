import { type Ref, use } from 'react';
import { Keyboard, StyleSheet, TextInput, type TextInputInstance, type TextInputProps } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { RevealFocusedInputContext } from '@/hooks/use-focused-input-above-keyboard';

export const PIN_LENGTH = 4;
export const TRIP_CODE_LENGTH = 6;

export function TextField({
  ref,
  onFocus,
  onContentSizeChange,
  ...props
}: TextInputProps & { ref?: Ref<TextInputInstance> }) {
  const revealFocusedInput = use(RevealFocusedInputContext);
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={Colors.muted}
      {...props}
      onFocus={(event) => {
        onFocus?.(event);
        revealFocusedInput();
      }}
      onContentSizeChange={(event) => {
        onContentSizeChange?.(event);
        if (props.multiline) revealFocusedInput();
      }}
      style={[styles.field, props.style]}
    />
  );
}

type PinFieldProps = {
  value: string;
  onChangeText: (pin: string) => void;
  hidden?: boolean;
} & Pick<TextInputProps, 'autoFocus' | 'accessibilityLabel'>;

// The iPhone number pad has no Done key, so the keyboard closes itself on the last digit.
export function PinField({ value, onChangeText, hidden = false, ...rest }: PinFieldProps) {
  return (
    <TextField
      {...rest}
      value={value}
      onChangeText={(text) => {
        const pin = text.replace(/\D/g, '').slice(0, PIN_LENGTH);
        onChangeText(pin);
        if (pin.length === PIN_LENGTH) Keyboard.dismiss();
      }}
      keyboardType="number-pad"
      maxLength={PIN_LENGTH}
      secureTextEntry={hidden}
      placeholder={'•'.repeat(PIN_LENGTH)}
      style={styles.pin}
    />
  );
}

type TripCodeFieldProps = {
  value: string;
  onChangeText: (code: string) => void;
  onSubmit: () => void;
};

export function TripCodeField({ value, onChangeText, onSubmit }: TripCodeFieldProps) {
  return (
    <TextField
      value={value}
      onChangeText={(text) =>
        onChangeText(
          text
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, TRIP_CODE_LENGTH),
        )
      }
      placeholder="ABCDEF"
      autoCapitalize="characters"
      autoCorrect={false}
      maxLength={TRIP_CODE_LENGTH}
      returnKeyType="go"
      onSubmitEditing={() => value.length === TRIP_CODE_LENGTH && onSubmit()}
      accessibilityLabel="Trip code"
      style={styles.code}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.ink,
  },
  pin: { fontFamily: Fonts.mono, fontSize: 30, letterSpacing: 14, textAlign: 'center' },
  code: { fontFamily: Fonts.mono, fontSize: 28, letterSpacing: 8, textAlign: 'center' },
});
