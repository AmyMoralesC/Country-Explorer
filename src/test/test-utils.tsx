/**
 * test-utils.tsx
 *
 * Any component that uses a TanStack Query hook (useCountries,
 * useCountryImage, etc.) needs a QueryClientProvider ancestor — without
 * one, useQuery throws immediately ("No QueryClient set"). Rather than
 * wrap every test file's render() calls by hand, this file exports a
 * drop-in replacement for Testing Library's render() that adds one.
 *
 * A fresh QueryClient per render (not a shared singleton) keeps tests
 * isolated — no leftover cache from one test leaking into the next.
 * retry: false makes failed queries fail fast instead of retrying with
 * backoff delays, which would otherwise make tests slow or flaky.
 */

import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything else from Testing Library so test files only need
// one import source.
export * from "@testing-library/react";