"use client";

/**
 * providers.tsx
 *
 * Client-side providers that wrap the entire app.
 * Kept in a separate file from layout.tsx because Next.js App Router
 * layouts are Server Components by default — they can't use hooks or
 * create QueryClient instances. We isolate "use client" here.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create the QueryClient inside useState so it's created once per component
  // lifecycle and not shared between server renders (SSR safety).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 1 hour — avoids unnecessary refetches.
            staleTime: 1000 * 60 * 60,
            // Show stale data while refetching in the background.
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools — visible only in development, stripped from production build */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
