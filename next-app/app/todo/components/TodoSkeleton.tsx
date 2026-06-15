import { Skeleton } from '@/components/ui/skeleton';

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col border-b border-border/30 pb-3 pt-4 gap-3">
      {/* Space title row */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
      </div>

      {/* Space nav tabs */}
      <div className="px-4 flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-xl flex-shrink-0" />
        ))}
        <Skeleton className="h-9 w-32 rounded-xl flex-shrink-0 opacity-50" />
      </div>
    </div>
  );
}

export function CanvasSkeleton() {
  return (
    <div className="flex-1 overflow-hidden pt-4 flex gap-4 px-4 relative bg-dot-pattern bg-[length:24px_24px]">
      <Skeleton className="absolute top-10 left-10 h-[300px] w-[350px] rounded-xl" />
      <Skeleton className="absolute top-20 left-[400px] h-[400px] w-[350px] rounded-xl" />
    </div>
  );
}

export function TodoSkeleton() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <HeaderSkeleton />
      <CanvasSkeleton />
    </div>
  );
}
