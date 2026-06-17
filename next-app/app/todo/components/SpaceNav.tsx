'use client';

import React, { useState } from 'react';
import { Space } from '@/hooks/useSpaces';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useMoveTextBox } from '@/hooks/useTextBoxes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpaceSettingsMenu } from './SpaceSettingsMenu';
import { toast } from 'sonner';

interface SpaceNavProps {
  spaces: Space[];
  onCreateSpace: (name: string, icon: string) => void;
}

const SPACE_ICONS = ['📋', '🏠', '💼', '🎓', '💻', '🏋️', '🎯', '📚', '🧪', '🌟'];

export function SpaceNav({ spaces, onCreateSpace }: SpaceNavProps) {
  const { activeSpaceId, setActiveSpace, draggingTextBox, setDraggingTextBox } =
    useWorkspaceStore();
  const moveTextBox = useMoveTextBox();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📋');
  const [dragOverSpaceId, setDragOverSpaceId] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateSpace(newName.trim(), newIcon);
    setNewName('');
    setNewIcon('📋');
    setIsCreating(false);
  };

  const handleDragOver = (e: React.DragEvent, spaceId: number) => {
    // Only accept if a textbox is being dragged and it's a different space
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
          onError: () => {
            toast.error('Failed to move text box');
          },
        },
      );
    } catch {
      // Invalid data — ignore
    }
    setDraggingTextBox(null);
  };

  return (
    <nav className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-none shrink-0">
      {spaces.map((space) => {
        const isDropTarget = dragOverSpaceId === space.id;
        const isDragActive = !!draggingTextBox && draggingTextBox.spaceId !== space.id;

        return (
          <div key={space.id} className="group relative flex items-center shrink-0">
            <button
              onClick={() => setActiveSpace(space.id)}
              onDragOver={(e) => handleDragOver(e, space.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, space.id)}
              className={cn(
                'flex items-center gap-2 pl-4 pr-10 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                activeSpaceId === space.id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                isDropTarget && 'ring-2 ring-primary bg-primary/10 scale-105',
                isDragActive && !isDropTarget && 'opacity-80',
              )}
            >
              {space.icon && <span className="text-base leading-none">{space.icon}</span>}
              {space.name}
            </button>
            <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <SpaceSettingsMenu space={space} />
            </div>
          </div>
        );
      })}

      {isCreating ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1 shrink-0">
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/40">
            {SPACE_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewIcon(icon)}
                className={cn(
                  'text-base px-1 rounded transition-all',
                  newIcon === icon ? 'bg-primary/30 scale-110' : 'hover:bg-muted/50',
                )}
              >
                {icon}
              </button>
            ))}
          </div>
          <Input
            autoFocus
            placeholder="Space name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 w-36 text-sm bg-muted/30"
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsCreating(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 shrink-0 text-muted-foreground hover:text-foreground gap-1.5"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          New Space
        </Button>
      )}
    </nav>
  );
}
