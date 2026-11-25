import { type Ref, use, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { makePumpStyles } from '@/components/receipt/pump-styles';
import { Fonts, Paper, Radius, Spacing } from '@/constants/theme';
import { RevealFocusedInputContext } from '@/hooks/use-focused-input-above-keyboard';
import { useThemedStyles } from '@/light-mode/use-themed-styles';

export const PIN_LENGTH = 4;
export const TRIP_CODE_LENGTH = 6;

export function TextField({
  ref,
  onFocus,
  onBlur,
  onContentSizeChange,
  ...props
}: TextInputProps & { ref?: Ref<TextInputInstance> }) {
  const revealFocusedInput = use(RevealFocusedInputContext);
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={Paper.muted}
      {...props}
      onFocus={(event) => {
        onFocus?.(event);
        setFocused(true);
        revealFocusedInput();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setFocused(false);
      }}
      onContentSizeChange={(event) => {
        onContentSizeChange?.(event);
        if (props.multiline) revealFocusedInput();
      }}
      style={[styles.field, focused && styles.focused, props.style]}
    />
  );
}

type DigitBoxesFieldProps = {
  length: number;
  value: string;
  onChangeText: (digits: string) => void;
  hidden?: boolean;
  // Called once every box is filled, after the keyboard has closed.
  onComplete?: (digits: string) => void;
} & Pick<TextInputProps, 'autoFocus' | 'accessibilityLabel' | 'textContentType' | 'autoComplete'>;

// One box per digit, drawn from the value over an invisible input (see TripCodeField).
// The iPhone number pad has no Done key, so the keyboard closes itself on the last digit.
export function DigitBoxesField({
  length,
  value,
  onChangeText,
  hidden = false,
  onComplete,
  ...rest
}: DigitBoxesFieldProps) {
  const [focused, setFocused] = useState(false);
  const activeBox = Math.min(value.length, length - 1);
  return (
    <View>
      <View style={styles.digitBoxes} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {Array.from({ length }, (_, index) => (
          <View key={index} style={[styles.digitBox, focused && index === activeBox && styles.focused]}>
            <Text testID="digit-box" style={styles.digit}>
              {value[index] === undefined ? '' : hidden ? '•' : value[index]}
            </Text>
          </View>
        ))}
      </View>
      <TextField
        {...rest}
        value={value}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, length);
          onChangeText(digits);
          if (digits.length === length) {
            Keyboard.dismiss();
            onComplete?.(digits);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        secureTextEntry={hidden}
        caretHidden
        selectionColor="transparent"
        style={styles.hiddenInput}
      />
    </View>
  );
}

type PinFieldProps = Omit<DigitBoxesFieldProps, 'length'>;

export function PinField(props: PinFieldProps) {
  return <DigitBoxesField length={PIN_LENGTH} {...props} />;
}

type TripCodeFieldProps = {
  value: string;
  onChangeText: (code: string) => void;
  onSubmit: () => void;
};

// The phone draws what was typed before onChangeText can uppercase it, so a lowercase letter would flash up.
// The input's own text is invisible; the code shown glows in a pump's LED window, drawn from the cleaned value.
export function TripCodeField({ value, onChangeText, onSubmit }: TripCodeFieldProps) {
  const pump = useThemedStyles(makePumpStyles);
  const [focused, setFocused] = useState(false);
  const remaining = TRIP_CODE_LENGTH - value.length;
  return (
    <View style={pump.housing}>
      <View
        style={[pump.window, styles.codeWindow]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden>
        <Text style={[pump.led, styles.codeText]}>
          <Text testID="trip-code-lit">{value}</Text>
          {remaining > 0 ? (
            <Text testID="trip-code-unlit">
              <Text style={focused ? styles.nextSlot : pump.unlit}>-</Text>
              <Text style={pump.unlit}>{'-'.repeat(remaining - 1)}</Text>
            </Text>
          ) : null}
        </Text>
      </View>
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        maxLength={TRIP_CODE_LENGTH}
        returnKeyType="go"
        onSubmitEditing={() => value.length === TRIP_CODE_LENGTH && onSubmit()}
        accessibilityLabel="Trip code"
        caretHidden
        selectionColor="transparent"
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: Paper.field,
    borderWidth: 1.5,
    borderColor: Paper.fieldLine,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Paper.ink,
  },
  focused: { borderColor: Paper.ink },
  digitBoxes: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  digitBox: {
    flex: 1,
    maxWidth: 56,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Paper.field,
    borderWidth: 2,
    borderColor: Paper.fieldLine,
    borderRadius: Radius.sm,
  },
  digit: { fontFamily: Fonts.heavy, fontSize: 28, color: Paper.ink },
  codeWindow: { alignItems: 'center', paddingVertical: Spacing.md },
  codeText: { fontSize: 34, lineHeight: 42, letterSpacing: 16, marginRight: -16 },
  nextSlot: { opacity: 0.5 },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: 'transparent',
  },
});
