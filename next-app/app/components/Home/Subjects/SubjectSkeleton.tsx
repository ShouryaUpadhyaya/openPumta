import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function SubjectSkeleton() {
  return (
    <div className="my-4">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="flex justify-between items-end gap-1.5 mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-b-0"
          >
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-1.5 flex-1 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
