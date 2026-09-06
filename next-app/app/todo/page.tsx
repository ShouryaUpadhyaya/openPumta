'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSpaces, useCreateSpace } from '@/hooks/useSpaces';
import { SpaceNav } from './components/SpaceNav';
import WorkspaceCanvas from './components/WorkspaceCanvas';
import { SpaceSettingsMenu } from './components/SpaceSettingsMenu';
import { CreateSpaceModal } from './components/CreateSpaceModal';
import { TextBoxFullscreen } from './components/TextBoxFullscreen';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { toast } from 'sonner';
import { LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TodoSkeleton } from './components/TodoSkeleton';

function WorkspaceInner() {
  const { activeSpaceId, setActiveSpace } = useWorkspaceStore();
  const { data: spaces, isLoading: spacesLoading } = useSpaces();
  const createSpace = useCreateSpace();
  const { hasSeenOnboarding, onboardingChoice, hasSeenConfetti } = useOnboardingStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Show strobe nudge right after onboarding, until confetti fires (all tasks done)
  const showNudge = onboardingChoice !== null && !hasSeenConfetti;

  // Separate active vs archived spaces
  const activeSpaces = spaces?.filter((s) => !s.isArchived) ?? [];
  const archivedSpaces = spaces?.filter((s) => s.isArchived) ?? [];

  // Auto-select first space when loaded, or when active space is no longer valid
  useEffect(() => {
    if (!spaces) return;
    const activeExists = spaces.some((s) => s.id === activeSpaceId && !s.deleted);
    if (!activeSpaceId || !activeExists) {
      const first = activeSpaces[0];
      setActiveSpace(first ? first.id : null);
    }
  }, [spaces, activeSpaceId, setActiveSpace, activeSpaces]);

  const handleCreateSpace = (name: string, icon: string) => {
    createSpace.mutate(
      { name, icon },
      {
        onSuccess: (space) => {
          setActiveSpace(space.id);
          setIsCreateModalOpen(false);
          toast.success(`"${name}" created`);
        },
        onError: () => toast.error('Failed to create workspace'),
      },
    );
  };

  if (spacesLoading) {
    return <TodoSkeleton />;
  }

  // Active space object (may be archived — user can browse archived spaces)
  const activeSpace = spaces?.find((s) => s.id === activeSpaceId);

  // ── No spaces at all ─────────────────────────────────────────────────────────
  if (!spaces || (activeSpaces.length === 0 && archivedSpaces.length === 0)) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 text-center px-4">
          <div className="p-5 rounded-2xl bg-primary/10 text-primary">
            <LayoutDashboard className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Create your first workspace</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Workspaces are your canvas — think &quot;Daily Planner&quot;, &quot;Coding&quot;,
              &quot;Fitness&quot;.
            </p>
          </div>
          <button
            onClick={() => {
              if (!hasSeenOnboarding) return;
              setIsCreateModalOpen(true);
            }}
            className={`px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30${showNudge ? ' nudge-strobe' : ''}`}
            data-tour-highlight="add-space-btn"
          >
            + Create workspace
          </button>
        </div>

        <CreateSpaceModal
          key={isCreateModalOpen ? 'modal-open-no-spaces' : 'modal-closed-no-spaces'}
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onCreateSpace={handleCreateSpace}
          isLoading={createSpace.isPending}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full" data-tour-highlight="workspace-page">
      {/* ── Top bar ── */}
      <div className="flex flex-col border-b border-border/30 pb-3 pt-4 gap-3">
        {/* Space title row */}
        <div className="px-4 flex items-center justify-between gap-4">
          <div className="group flex items-center gap-2 min-w-0">
            {activeSpace?.icon && (
              <span className="text-2xl leading-none shrink-0">{activeSpace.icon}</span>
            )}
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {activeSpace?.name ?? 'Workspace'}
              {activeSpace?.isArchived && (
                <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  Archived
                </span>
              )}
            </h1>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {activeSpace && <SpaceSettingsMenu space={activeSpace} />}
            </div>
          </div>

          {/* Quick-add workspace button in header */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Create new workspace"
            title="New workspace"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <SpaceNav
          spaces={activeSpaces}
          archivedSpaces={archivedSpaces}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 overflow-hidden">
        {!activeSpaceId ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Select a workspace to get started
          </div>
        ) : (
          <WorkspaceCanvas />
        )}
      </div>

      {/* ── Create Space Modal ── */}
      <CreateSpaceModal
        key={isCreateModalOpen ? 'modal-open' : 'modal-closed'}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateSpace={handleCreateSpace}
        isLoading={createSpace.isPending}
      />

      {/* ── Fullscreen text box portal ── */}
      {activeSpaceId && activeSpace && (
        <TextBoxFullscreen
          spaceId={activeSpaceId}
          spaceName={activeSpace.name}
          spaceIcon={activeSpace.icon}
        />
      )}
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
