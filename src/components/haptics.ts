import * as Haptics from 'expo-haptics';

// Haptics are a nicety: a phone without them, or one that refuses, carries on silently.
const ignore = () => {};

export const haptics = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore),
  tick: () => Haptics.selectionAsync().catch(ignore),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(ignore),
};
