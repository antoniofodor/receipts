import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/api/query-client';
import { GroundStatusBar } from '@/components/ground/ground-status-bar';
import { StartupError } from '@/components/startup-error';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useRefetchOnAppForeground } from '@/hooks/use-refetch-on-app-foreground';
import { LightModeProvider, useGround, useLightMode } from '@/light-mode/light-mode-provider';
import { SessionProvider, useSession } from '@/session/session-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useRefetchOnAppForeground();
  const fontsReady = useAppFonts();
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <LightModeProvider>
          <SessionProvider>
            <GroundStatusBar />
            <HideSplashWhenReady fontsReady={fontsReady} />
            {fontsReady ? <RootNavigator /> : null}
          </SessionProvider>
        </LightModeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function HideSplashWhenReady({ fontsReady }: { fontsReady: boolean }) {
  const { isLoading } = useSession();
  const { isLoaded: lightLoaded } = useLightMode();
  const ready = fontsReady && !isLoading && lightLoaded;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  return null;
}

function RootNavigator() {
  const { isLoading, membership, startupError, retryStartup } = useSession();
  const { isLoaded: lightLoaded } = useLightMode();
  const ground = useGround();
  if (isLoading || !lightLoaded) return null;
  if (startupError && !membership) return <StartupError message={startupError} onRetry={retryStartup} />;

  const isInTrip = membership !== null;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ground.ground },
      }}>
      <Stack.Screen name="account" options={{ presentation: 'modal' }} />
      <Stack.Protected guard={isInTrip}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="player/[id]" />
        <Stack.Screen name="entry/[id]" />
        <Stack.Screen name="share/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="rule-packs" options={{ presentation: 'modal' }} />
        <Stack.Screen name="rule/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="custom-pack/[id]" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!isInTrip}>
        <Stack.Screen name="join" />
        <Stack.Screen name="create-trip" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
