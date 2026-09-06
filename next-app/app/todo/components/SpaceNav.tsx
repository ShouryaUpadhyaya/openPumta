'use client';

import React, { useState } from 'react';
import { Space, useReorderSpaces } from '@/hooks/useSpaces';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useMoveTextBox } from '@/hooks/useTextBoxes';
import { Button } from '@/components/ui/button';
import { Plus, Archive, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpaceSettingsMenu } from './SpaceSettingsMenu';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SpaceNavProps {
  spaces: Space[];
  archivedSpaces: Space[];
  onOpenCreateModal: () => void;
}

// ─── Sortable Tab ──────────────────────────────────────────────────────────────

function SortableSpaceTab({
  space,
  isActive,
  isDragTarget,
  isDragActive,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  space: Space;
  isActive: boolean;
  isDragTarget: boolean;
  isDragActive: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: space.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center shrink-0"
      {...attributes}
      {...listeners}
    >
      <button
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'flex items-center gap-2 pl-3 pr-8 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          isDragTarget && 'ring-2 ring-primary bg-primary/10 scale-105',
          isDragActive && !isDragTarget && 'opacity-70',
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        {space.icon && <span className="text-base leading-none">{space.icon}</span>}
        {space.name}
      </button>
      {/* Settings menu — shown on hover */}
      <div className="absolute right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <SpaceSettingsMenu space={space} />
      </div>
    </div>
  );
}

// ─── Main SpaceNav ─────────────────────────────────────────────────────────────

export function SpaceNav({ spaces, archivedSpaces, onOpenCreateModal }: SpaceNavProps) {
  const { activeSpaceId, setActiveSpace, draggingTextBox, setDraggingTextBox } =
    useWorkspaceStore();
  const moveTextBox = useMoveTextBox();
  const reorderSpaces = useReorderSpaces();
  const [dragOverSpaceId, setDragOverSpaceId] = useState<number | null>(null);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // @dnd-kit sensors for tab reordering
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // ─── Cross-space textbox drop handlers ──────────────────────────────────────

  const handleDragOver = (e: React.DragEvent, spaceId: number) => {
    if (!draggingTextBox || draggingTextBox.spaceId === spaceId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSpaceId(spaceId);
  };

  const handleDragLeave = () => {
    setDragOverSpaceId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSpaceId: number) => {
    e.preventDefault();
    setDragOverSpaceId(null);

    try {
      const raw = e.dataTransfer.getData('application/textbox-move');
      if (!raw) return;
      const { textBoxId, sourceSpaceId } = JSON.parse(raw);
      if (sourceSpaceId === targetSpaceId) return;

      moveTextBox.mutate(
        { id: textBoxId, sourceSpaceId, targetSpaceId },
        {
          onSuccess: () => {
            const targetSpace = spaces.find((s) => s.id === targetSpaceId);
            toast.success(`Moved to "${targetSpace?.name ?? 'space'}"`);
            setActiveSpace(targetSpaceId);
          },
          onError: () => toast.error('Failed to move text box'),
        },
      );
    } catch {
      // Invalid data — ignore
    }
    setDraggingTextBox(null);
  };

  // ─── Tab drag-to-reorder handlers ───────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = spaces.findIndex((s) => s.id === active.id);
    const newIndex = spaces.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(spaces, oldIndex, newIndex);
    const updates = reordered.map((s, i) => ({ id: s.id, order: i }));

    reorderSpaces.mutate(updates, {
      onError: () => toast.error('Failed to save order'),
    });
  };

  const activeDragSpace = activeDragId ? spaces.find((s) => s.id === activeDragId) : null;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Active spaces row ── */}
      <nav
        className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-none shrink-0"
        aria-label="Workspaces"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={spaces.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
            {spaces.map((space) => (
              <SortableSpaceTab
                key={space.id}
                space={space}
                isActive={activeSpaceId === space.id}
                isDragTarget={dragOverSpaceId === space.id}
                isDragActive={!!draggingTextBox && draggingTextBox.spaceId !== space.id}
                onClick={() => setActiveSpace(space.id)}
                onDragOver={(e) => handleDragOver(e, space.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, space.id)}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeDragSpace ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/40 opacity-90">
                {activeDragSpace.icon && (
                  <span className="text-base leading-none">{activeDragSpace.icon}</span>
                )}
                {activeDragSpace.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* New workspace button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-4 shrink-0 text-muted-foreground hover:text-foreground gap-1.5"
          onClick={onOpenCreateModal}
          aria-label="Create new workspace"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </nav>

      {/* ── Archived spaces section ── */}
      {archivedSpaces.length > 0 && (
        <div className="px-4 mt-1">
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-1 rounded"
            onClick={() => setShowArchived((v) => !v)}
            aria-expanded={showArchived}
          >
            <Archive className="h-3 w-3" />
            Archived ({archivedSpaces.length})
            {showArchived ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {showArchived && (
            <div className="flex flex-wrap gap-1 mt-1 pl-1">
              {archivedSpaces.map((space) => (
                <div key={space.id} className="group relative flex items-center shrink-0">
                  <button
                    onClick={() => setActiveSpace(space.id)}
                    className={cn(
                      'flex items-center gap-1.5 pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/40 opacity-70 hover:opacity-100',
                      activeSpaceId === space.id && 'opacity-100 bg-muted/50',
                    )}
                  >
                    {space.icon && <span className="text-sm leading-none">{space.icon}</span>}
                    {space.name}
                  </button>
                  <div className="absolute right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <SpaceSettingsMenu space={space} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
