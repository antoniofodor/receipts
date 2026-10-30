import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Membership } from '@/api/trips';

const MEMBERSHIP_KEY = 'pointtracker.membership';
const LAST_TRIP_KEY = 'pointtracker.lastTrip';

export type LastTrip = { code: string; name: string };

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const readSavedMembership = () => readJson<Membership>(MEMBERSHIP_KEY);

export const readLastTrip = () => readJson<LastTrip>(LAST_TRIP_KEY);

export async function saveMembership(membership: Membership | null) {
  if (!membership) {
    await AsyncStorage.removeItem(MEMBERSHIP_KEY);
    return;
  }
  const lastTrip: LastTrip = { code: membership.join_code, name: membership.trip_name };
  await AsyncStorage.multiSet([
    [MEMBERSHIP_KEY, JSON.stringify(membership)],
    [LAST_TRIP_KEY, JSON.stringify(lastTrip)],
  ]);
}
