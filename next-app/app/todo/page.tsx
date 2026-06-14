'use client';

import React, { useEffect, Suspense } from 'react';
import { useSpaces, useCreateSpace } from '@/hooks/useSpaces';
import { useColumns } from '@/hooks/useColumns';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { SpaceNav } from './components/SpaceNav';
import { FilterBar } from './components/FilterBar';
import { SpaceBoard } from './components/SpaceBoard';
import { SpaceSettingsMenu } from './components/SpaceSettingsMenu';
import { toast } from 'sonner';
import { LayoutDashboard } from 'lucide-react';

import { TodoSkeleton, BoardSkeleton } from './components/TodoSkeleton';

function WorkspaceInner() {
  const { activeSpaceId, activeFilter, dateRange, setActiveSpace } = useWorkspaceStore();
  const { data: spaces, isLoading: spacesLoading } = useSpaces();
  const { data: columns, isLoading: columnsLoading } = useColumns(activeSpaceId);
  const createSpace = useCreateSpace();

  // Auto-select first space when loaded
  useEffect(() => {
    if (spaces && spaces.length > 0 && !activeSpaceId) {
      setActiveSpace(spaces[0].id);
    }
  }, [spaces, activeSpaceId, setActiveSpace]);

  const handleCreateSpace = (name: string, icon: string) => {
    createSpace.mutate(
      { name, icon },
      {
        onSuccess: (space) => {
          setActiveSpace(space.id);
          toast.success(`Space "${name}" created`);
        },
        onError: () => toast.error('Failed to create space'),
      },
    );
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (spacesLoading) {
    return <TodoSkeleton />;
  }

  // ─── Empty state — no spaces ───────────────────────────────────────────────
  if (!spaces || spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5 text-center px-4">
        <div className="p-5 rounded-2xl bg-primary/10 text-primary">
          <LayoutDashboard className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Create your first Space</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Spaces are your workspaces — think &quot;Daily Planner&quot;, &quot;Coding&quot;,
            &quot;Fitness&quot;.
          </p>
        </div>
        <button
          onClick={() => handleCreateSpace('Daily Planner', '📋')}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
        >
          + Create &quot;Daily Planner&quot;
        </button>
      </div>
    );
  }

  const activeSpace = spaces.find((s) => s.id === activeSpaceId);

  return (
    <div className="flex flex-col h-full" data-tour-highlight="workspace-page">
      {/* ── Top bar: Space name + Space tabs ── */}
      <div className="flex flex-col border-b border-border/30 pb-3 pt-4 gap-3">
        {/* Space title row */}
        <div className="px-4 flex items-center justify-between gap-4">
          <div className="group flex items-center gap-2 min-w-0">
            {activeSpace?.icon && (
              <span className="text-2xl leading-none flex-shrink-0">{activeSpace.icon}</span>
            )}
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {activeSpace?.name ?? 'Workspace'}
            </h1>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {activeSpace && <SpaceSettingsMenu space={activeSpace} />}
            </div>
          </div>
        </div>

        {/* Space nav tabs */}
        <SpaceNav spaces={spaces} onCreateSpace={handleCreateSpace} />
      </div>

      {/* ── Filter bar ── */}
      <div className="py-2 border-b border-border/20">
        <FilterBar />
      </div>

      {/* ── Board ── */}
      <div className="flex-1 overflow-hidden pt-4">
        {!activeSpaceId ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Select a space to get started
          </div>
        ) : columnsLoading ? (
          <BoardSkeleton />
        ) : (
          <SpaceBoard
            spaceId={activeSpaceId}
            columns={columns ?? []}
            filter={activeFilter}
            dateRange={dateRange}
          />
        )}
      </div>
    </div>
  );
}

export default function TodoPage() {
  return (
    <Suspense fallback={<TodoSkeleton />}>
      <WorkspaceInner />
    </Suspense>
  );
}
