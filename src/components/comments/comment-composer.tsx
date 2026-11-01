import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COMMENT_MAX_LENGTH } from '@/api/comments';
import { TextField } from '@/components/text-fields';
import { ErrorText } from '@/components/typography';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';

type CommentComposerProps = {
  placeholder: string;
  inputLabel: string;
  onSend: (body: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
};

// Sent with the keyboard's Send key. The field clears straight away and gets the text back if the server refuses it.
export function CommentComposer({ placeholder, inputLabel, onSend, onCancel, autoFocus }: CommentComposerProps) {
  const [body, setBody] = useState('');
  const { error, run } = useAsyncAction();

  function send() {
    const sent = body;
    if (sent.trim().length === 0) return;
    setBody('');
    run(async () => {
      try {
        await onSend(sent);
      } catch (caught) {
        setBody(sent);
        throw caught;
      }
    });
  }

  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        <TextField
          value={body}
          onChangeText={setBody}
          placeholder={placeholder}
          multiline
          // The box grows with the text instead, so an empty box can't be scrolled.
          scrollEnabled={false}
          returnKeyType="send"
          submitBehavior="submit"
          enablesReturnKeyAutomatically
          onSubmitEditing={send}
          maxLength={COMMENT_MAX_LENGTH}
          autoFocus={autoFocus}
          accessibilityLabel={inputLabel}
          style={styles.input}
        />
        {onCancel ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel reply" onPress={onCancel} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  input: { flex: 1 },
  cancel: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
});
