import { useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Root stack: the tab navigator, with the detail screen pushed over it
// (so the tab bar is out of the way on the detail view).
export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pokemon/[id]" />
          <Stack.Screen name="compare" />
          <Stack.Screen name="team" />
          <Stack.Screen name="calc" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="pokedex" />
          <Stack.Screen name="daily" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
