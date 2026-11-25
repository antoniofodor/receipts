export type LightMode = 'day' | 'night';
export type LightPreference = 'auto' | LightMode;

export const LIGHT_PREFERENCES: readonly LightPreference[] = ['auto', 'day', 'night'];

export const DAY_STARTS_AT_HOUR = 6;
export const NIGHT_STARTS_AT_HOUR = 19;

function hourLabel(hour: number) {
  const suffix = hour < 12 ? 'am' : 'pm';
  return `${hour % 12 === 0 ? 12 : hour % 12}${suffix}`;
}

// When the light next changes on its own, for the Lights setting: "Night from 7pm".
export function nextLightLabel(mode: LightMode) {
  return mode === 'day' ? `Night from ${hourLabel(NIGHT_STARTS_AT_HOUR)}` : `Day from ${hourLabel(DAY_STARTS_AT_HOUR)}`;
}

export function isLightPreference(value: unknown): value is LightPreference {
  return LIGHT_PREFERENCES.includes(value as LightPreference);
}

export function lightModeAt(date: Date, preference: LightPreference): LightMode {
  if (preference !== 'auto') return preference;
  const hour = date.getHours();
  return hour >= DAY_STARTS_AT_HOUR && hour < NIGHT_STARTS_AT_HOUR ? 'day' : 'night';
}

// Built from calendar fields rather than by adding hours, so a daylight saving change can't shift it.
export function nextLightChange(date: Date): Date {
  const hour = date.getHours();
  const at = (dayOffset: number, changeHour: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset, changeHour);
  if (hour < DAY_STARTS_AT_HOUR) return at(0, DAY_STARTS_AT_HOUR);
  if (hour < NIGHT_STARTS_AT_HOUR) return at(0, NIGHT_STARTS_AT_HOUR);
  return at(1, DAY_STARTS_AT_HOUR);
}
