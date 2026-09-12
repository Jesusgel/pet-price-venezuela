'use client';

import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { useState, useMemo } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 24 * 60 * 60 * 1000,
            networkMode: 'offlineFirst',
            retry: 2,
          },
        },
      }),
  );

  const persister = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return createAsyncStoragePersister({
      storage: {
        getItem: async (key: string) => {
          const value = await get(key);
          return value ?? null;
        },
        setItem: (key: string, value: string) => set(key, value),
        removeItem: (key: string) => del(key),
      },
    });
  }, []);

  if (!persister) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success',
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
