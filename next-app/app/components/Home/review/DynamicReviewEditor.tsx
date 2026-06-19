'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const DynamicReviewEditor = dynamic(() => import('./ReviewEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton className="h-6 w-full max-w-[200px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  ),
});
