import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';

import { Ground, type GroundPalette } from '@/constants/theme';
import { readLightPreference, saveLightPreference } from '@/light-mode/light-preference-storage';
import { lightModeAt, nextLightChange, type LightMode, type LightPreference } from '@/utils/light-mode';

type LightModeContextValue = {
  isLoaded: boolean;
  mode: LightMode;
  preference: LightPreference;
  setPreference: (preference: LightPreference) => void;
};

// Outside the provider (component tests) everything renders in day mode, so tests don't depend on the clock.
const LightModeContext = createContext<LightModeContextValue>({
  isLoaded: true,
  mode: 'day',
  preference: 'day',
  setPreference: () => {},
});

// Holds the light at one mode, whatever the clock says.
export function FixedLightMode({ mode, children }: PropsWithChildren<{ mode: LightMode }>) {
  const value = useMemo(() => ({ isLoaded: true, mode, preference: mode, setPreference: () => {} }), [mode]);
  return <LightModeContext value={value}>{children}</LightModeContext>;
}

export function useLightMode() {
  return use(LightModeContext);
}

export function useGround(): GroundPalette {
  return Ground[useLightMode().mode];
}

export function LightModeProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [preference, setPreferenceState] = useState<LightPreference>('auto');
  const [now, setNow] = useState(() => new Date());
  const choseBeforeLoad = useRef(false);

  useEffect(() => {
    readLightPreference().then((stored) => {
      if (stored && !choseBeforeLoad.current) setPreferenceState(stored);
      setIsLoaded(true);
    });
  }, []);

  // Timers don't run while the app is in the background, so the light is also checked on return.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setNow(new Date()), nextLightChange(now).getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [now]);

  const setPreference = useCallback((next: LightPreference) => {
    choseBeforeLoad.current = true;
    setPreferenceState(next);
    saveLightPreference(next);
  }, []);

  const mode = lightModeAt(now, preference);
  const value = useMemo(
    () => ({ isLoaded, mode, preference, setPreference }),
    [isLoaded, mode, preference, setPreference],
  );
  return <LightModeContext value={value}>{children}</LightModeContext>;
}
