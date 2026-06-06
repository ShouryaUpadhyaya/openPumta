import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function HabitSkeleton() {
  return (
    <section className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <div className="flex-1 overflow-hidden grid gap-2 content-start pt-2 p-1 -m-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-3 rounded-xl border bg-background border-border/40"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}
