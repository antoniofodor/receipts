import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

// React Native has no window focus event, so TanStack Query is told about the app returning
// to the foreground; stale queries refetch then, covering changes missed while backgrounded.
export function useRefetchOnAppForeground() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'));
    return () => subscription.remove();
  }, []);
}
