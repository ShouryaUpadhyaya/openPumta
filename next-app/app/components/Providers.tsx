'use client';

import React, { useMemo } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { TimerManager } from './pomodoro/TimerManager';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24,
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
    [],
  );

  const persister = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createSyncStoragePersister({
      storage: window.localStorage,
    });
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: persister || (undefined as any),
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      <TimerManager />
      {children}
    </PersistQueryClientProvider>
  );
}
