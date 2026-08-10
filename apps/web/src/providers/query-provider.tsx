'use client';

import { keepPreviousData, QueryClient, QueryClientProvider, type Query } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tuned for slow / flaky connections: serve cached data for a while,
            // keep it for a day, and don't refetch on focus. offlineFirst means a
            // cached result is used immediately and the network is only hit when the
            // cache is empty — so the app stays usable on very low bandwidth.
            staleTime: 5 * 60_000, // 5 min
            gcTime: 24 * 60 * 60_000, // 1 day
            // Keep showing the previous results while a new query (filter/page/search)
            // loads — no skeleton flash, so lists feel instant and smooth.
            placeholderData: keepPreviousData,
            // Don't retry client errors (401/403/404) — pointless and slow. Only
            // retry transient/network/5xx failures, twice.
            retry: (failureCount, error) => {
              const status = (error as { status?: number })?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            networkMode: 'offlineFirst',
          },
          mutations: {
            networkMode: 'offlineFirst',
          },
        },
      }),
  );

  const [persister] = useState(() =>
    typeof window === 'undefined'
      ? null
      : createSyncStoragePersister({ storage: window.localStorage, key: 'edubridge-query-cache' }),
  );

  // On the server there's no localStorage, so use a plain provider; on the client
  // the persisted cache hydrates so a reload shows content instantly (no round-trip).
  if (!persister) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60_000,
        buster: 'v3',
        dehydrateOptions: {
          // Virtual-internship enrollment/task state decides which whole
          // sections of the page render (My Courses vs hero, which tracks
          // still show in "Choose your track", task progress) — showing a
          // persisted-but-stale snapshot on reload before the real fetch
          // resolves makes the page visibly flash from an old layout to the
          // current one. Exclude it from persistence so a reload always
          // starts from a loading state and settles once, instead of
          // rendering last session's answer first.
          shouldDehydrateQuery: (query: Query) => query.queryKey[0] !== 'virtual-internship',
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
