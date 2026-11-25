import { StatusBar } from 'expo-status-bar';

import { useLightMode } from '@/light-mode/light-mode-provider';

export function GroundStatusBar() {
  const { mode } = useLightMode();
  return <StatusBar style={mode === 'night' ? 'light' : 'dark'} />;
}
