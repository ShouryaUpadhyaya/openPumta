'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore, FilterType } from '@/store/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, AlertTriangle, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTERS: { key: FilterType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: null },
  { key: 'today', label: 'Today', icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'last1w', label: 'Last 1w', icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { key: 'overdue', label: 'Overdue', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { key: 'dateRange', label: 'Date range', icon: <CalendarRange className="h-3.5 w-3.5" /> },
];

export function FilterBar() {
  const { activeFilter, setFilter } = useWorkspaceStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (filter: FilterType) => {
    setFilter(filter);
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 px-4 flex-wrap">
      {FILTERS.map(({ key, label, icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => handleFilter(key)}
          className={cn(
            'h-7 px-3 gap-1.5 rounded-lg text-xs font-medium transition-all duration-200',
            activeFilter === key
              ? 'bg-muted text-foreground border border-border/60'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
          )}
        >
          {icon}
          {label}
        </Button>
      ))}
    </div>
  );
}
