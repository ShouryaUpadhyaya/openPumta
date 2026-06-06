import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function StatsSkeleton() {
  return (
    <section className="flex flex-col h-full p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-100 mb-4 shrink-0">
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
          <CardHeader className="py-2 px-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="flex items-end gap-1 h-full">
              {[60, 45, 80, 35, 70, 50, 90].map((h, i) => (
                <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
          <CardHeader className="py-2 px-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-75 shrink-0">
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
          <CardHeader className="py-2 px-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="bg-background border-border/40 overflow-hidden flex flex-col shadow-none">
          <CardHeader className="py-2 px-4">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
