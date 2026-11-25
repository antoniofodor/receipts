import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

// A wrapper rather than a parent element, so rerender keeps the providers. The gesture root stands in for the
// one in the app's root layout.
export function renderWithQueryClient(ui: ReactElement, queryClient = createTestQueryClient()) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GestureHandlerRootView>
  );
  return render(ui, { wrapper });
}
