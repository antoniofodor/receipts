import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { queryClient } from "@/api/query-client";
import { StartupError } from "@/components/startup-error";
import { Colors } from "@/constants/theme";
import { useRefetchOnAppForeground } from "@/hooks/use-refetch-on-app-foreground";
import { SessionProvider, useSession } from "@/session/session-provider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useRefetchOnAppForeground();
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <StatusBar style="dark" />
        <HideSplashWhenReady />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}

function HideSplashWhenReady() {
  const { isLoading } = useSession();
  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);
  return null;
}

function RootNavigator() {
  const { isLoading, membership, startupError, retryStartup } = useSession();
  if (isLoading) return null;
  if (startupError && !membership)
    return <StartupError message={startupError} onRetry={retryStartup} />;

  const isInTrip = membership !== null;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Protected guard={isInTrip}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="log" options={{ presentation: "modal" }} />
        <Stack.Screen name="player/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isInTrip}>
        <Stack.Screen name="join" />
        <Stack.Screen name="create-trip" />
      </Stack.Protected>
    </Stack>
  );
}
