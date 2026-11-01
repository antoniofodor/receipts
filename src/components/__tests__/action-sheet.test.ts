import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { showActionSheet } from '@/components/action-sheet';

const choices = [
  { label: 'Take photo', value: 'camera' },
  { label: 'Choose from library', value: 'library' },
];

describe('showActionSheet', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it('uses the iOS action sheet, with Cancel last', async () => {
    Platform.OS = 'ios';
    const sheet = jest
      .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
      .mockImplementation((_options, callback) => callback(1));

    await expect(showActionSheet('Add a photo', choices)).resolves.toBe('library');
    expect(sheet.mock.calls[0][0]).toMatchObject({
      title: 'Add a photo',
      options: ['Take photo', 'Choose from library', 'Cancel'],
      cancelButtonIndex: 2,
    });
  });

  it('shows destructive choices in red', async () => {
    Platform.OS = 'ios';
    const sheet = jest
      .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
      .mockImplementation((_options, callback) => callback(1));
    const editChoices = [
      { label: 'Change photo', value: 'change' },
      { label: 'Remove photo', value: 'remove', destructive: true },
    ];

    await expect(showActionSheet('Profile photo', editChoices)).resolves.toBe('remove');
    expect(sheet.mock.calls[0][0]).toMatchObject({ destructiveButtonIndex: [1] });

    Platform.OS = 'android';
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    void showActionSheet('Profile photo', editChoices);
    expect(alert.mock.calls[0][2]?.[1]).toMatchObject({ text: 'Remove photo', style: 'destructive' });
  });

  it('resolves to nothing when cancelled on iOS', async () => {
    Platform.OS = 'ios';
    jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation((_options, callback) => callback(2));

    await expect(showActionSheet('Add a photo', choices)).resolves.toBeNull();
  });

  it('uses a dialog on Android', async () => {
    Platform.OS = 'android';
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => buttons?.[0].onPress?.());

    await expect(showActionSheet('Add a photo', choices)).resolves.toBe('camera');
  });
});
