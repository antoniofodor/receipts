import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { showActionSheet } from '@/components/action-sheet';
import { Avatar } from '@/components/avatar';
import { haptics } from '@/components/haptics';
import { Icon } from '@/components/icon';
import { ErrorText, Title } from '@/components/typography';
import { Colors, Spacing } from '@/constants/theme';
import { useAsyncAction } from '@/hooks/use-async-action';
import { usePhotoPicker } from '@/hooks/use-photo-picker';
import { useProfilePhoto } from '@/hooks/use-profile-photo';

const PHOTO_SOURCES = [
  { label: 'Take photo', value: 'camera' },
  { label: 'Choose from library', value: 'library' },
] as const;

// Android dialogs fit two choices, so with a photo already set, changing it is one step further in.
const EXISTING_PHOTO_CHOICES = [
  { label: 'Change photo', value: 'change' },
  { label: 'Remove photo', value: 'remove', destructive: true },
] as const;

const AVATAR_SIZE = 64;

// Your name with your photo beside it. Everything about the photo starts from tapping it.
export function ProfileHeader({ name, roles }: { name: string; roles: string }) {
  const { me, change, remove } = useProfilePhoto();
  const picker = usePhotoPicker();
  const { busy, error, run } = useAsyncAction();
  const photoPath = me?.photo_path ?? null;

  async function pickNewPhoto() {
    const source = await showActionSheet('Profile photo', [...PHOTO_SOURCES]);
    if (source === null) return;
    const photo = source === 'camera' ? await picker.takeProfilePhoto() : await picker.chooseProfilePhoto();
    if (photo) await change(photo);
  }

  function editPhoto() {
    haptics.tap();
    run(async () => {
      if (!photoPath) return pickNewPhoto();
      const choice = await showActionSheet('Profile photo', [...EXISTING_PHOTO_CHOICES]);
      if (choice === 'change') await pickNewPhoto();
      if (choice === 'remove') await remove();
    });
  }

  return (
    <View style={styles.stack}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={photoPath ? 'Edit profile photo' : 'Add profile photo'}
          accessibilityState={{ busy }}
          onPress={editPhoto}
          disabled={busy}
          style={({ pressed }) => pressed && styles.pressed}>
          <Avatar name={name} color={me?.color ?? Colors.muted} photoPath={photoPath} size={AVATAR_SIZE} />
          <View style={styles.badge}>
            {busy ? (
              <ActivityIndicator size="small" color={Colors.onAccent} />
            ) : (
              <Icon name="camera" size={12} color={Colors.onAccent} />
            )}
          </View>
        </Pressable>
        <View style={styles.name}>
          <Title eyebrow={roles || undefined}>{name}</Title>
        </View>
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const BADGE_SIZE = 24;

const styles = StyleSheet.create({
  stack: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  pressed: { opacity: 0.6 },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.background,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1 },
});
