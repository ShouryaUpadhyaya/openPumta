'use client';

import React, { useMemo, useEffect } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { TimerManager } from './pomodoro/TimerManager';
import { toast } from 'sonner';
import { Block } from '@/hooks/useBlocks';

/** Checks all cached blocks every 60s for past reminderAt times and fires toasts */
function ReminderWatcher() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Walk all 'blocks' queries in the cache
      const cache = queryClient.getQueryCache();
      cache.getAll().forEach((query) => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key[0] !== 'blocks') return;
        const blocks = query.state.data as Block[] | undefined;
        if (!blocks) return;

        blocks.forEach((block) => {
          if (!block.reminderAt || block.isCompleted) return;
          const remAt = new Date(block.reminderAt);
          if (remAt >= fiveMinAgo && remAt <= now) {
            toast.info(`⏰ Reminder: ${block.content || 'Task'}`, {
              description: 'This task has a reminder set.',
              duration: 8000,
            });
          }
        });
      });
    };

    check(); // Run immediately
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  return null;
}

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
      <ReminderWatcher />
      {children}
    </PersistQueryClientProvider>
  );
}
