import AsyncStorage from '@react-native-async-storage/async-storage';

import { isLightPreference, type LightPreference } from '@/utils/light-mode';

const LIGHT_PREFERENCE_KEY = 'pointtracker.lightPreference';

export async function readLightPreference(): Promise<LightPreference | null> {
  try {
    const stored = await AsyncStorage.getItem(LIGHT_PREFERENCE_KEY);
    return isLightPreference(stored) ? stored : null;
  } catch {
    return null;
  }
}

export async function saveLightPreference(preference: LightPreference) {
  try {
    await AsyncStorage.setItem(LIGHT_PREFERENCE_KEY, preference);
  } catch {
    // Losing the setting only means the phone follows the clock again next launch.
  }
}
