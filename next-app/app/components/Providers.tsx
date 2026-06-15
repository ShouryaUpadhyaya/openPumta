'use client';

import React, { useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { Persister } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { TimerManager } from './pomodoro/TimerManager';
import { toast } from 'sonner';

import { queryClient } from '@/lib/queryClient';

const noopPersister: Persister = {
  persistClient: async () => undefined,
  restoreClient: async () => undefined,
  removeClient: async () => undefined,
};

export default function Providers({ children }: { children: React.ReactNode }) {
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
        persister: persister || noopPersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      <TimerManager />

      {children}
    </PersistQueryClientProvider>
  );
}
