'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
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
      persistOptions={{ persister, maxAge: 24 * 60 * 60_000, buster: 'v1' }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
