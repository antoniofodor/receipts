import { ActionSheetIOS, Alert, Platform } from 'react-native';

type Choice<T> = { label: string; value: T };

// The platform's own chooser: the iOS action sheet, or a dialog on Android, which has no built-in sheet.
// Android dialogs fit at most two choices plus Cancel. Resolves to null when cancelled.
export function showActionSheet<T>(title: string, choices: Choice<T>[]): Promise<T | null> {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      const cancelIndex = choices.length;
      ActionSheetIOS.showActionSheetWithOptions(
        { title, options: [...choices.map((choice) => choice.label), 'Cancel'], cancelButtonIndex: cancelIndex },
        (index) => resolve(index === cancelIndex ? null : choices[index].value),
      );
      return;
    }
    Alert.alert(
      title,
      undefined,
      [
        ...choices.map((choice) => ({ text: choice.label, onPress: () => resolve(choice.value) })),
        { text: 'Cancel', style: 'cancel' as const, onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
