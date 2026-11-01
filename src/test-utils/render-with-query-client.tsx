import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

// A wrapper rather than a parent element, so rerender keeps the provider.
export function renderWithQueryClient(ui: ReactElement, queryClient = createTestQueryClient()) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(ui, { wrapper });
}
