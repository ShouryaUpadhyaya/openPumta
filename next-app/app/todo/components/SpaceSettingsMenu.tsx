'use client';

import React, { useState } from 'react';
import { Space, useUpdateSpace, useDeleteSpace } from '@/hooks/useSpaces';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash, Archive, ArchiveRestore } from 'lucide-react';
import EditDialog from './EditDialog';

const SPACE_ICONS = ['📋', '🏠', '💼', '🎓', '💻', '🏋️', '🎯', '📚', '🧪', '🌟'];

interface SpaceSettingsMenuProps {
  space: Space;
}

export function SpaceSettingsMenu({ space }: SpaceSettingsMenuProps) {
  const updateSpace = useUpdateSpace();
  const deleteSpace = useDeleteSpace();
  const { activeSpaceId, setActiveSpace } = useWorkspaceStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editName, setEditName] = useState(space.name);
  const [editIcon, setEditIcon] = useState(space.icon || '📋');

  // Reset form when space changes
  React.useEffect(() => {
    setEditName(space.name);
    setEditIcon(space.icon || '📋');
  }, [space]);

  const handleUpdateSpace = () => {
    if (!editName.trim()) return;
    updateSpace.mutate(
      { id: space.id, name: editName.trim(), icon: editIcon },
      {
        onSuccess: () => {
          toast.success('Workspace updated');
          setIsEditDialogOpen(false);
        },
        onError: () => toast.error('Failed to update workspace'),
      },
    );
  };

  const handleArchive = () => {
    updateSpace.mutate(
      { id: space.id, isArchived: true },
      {
        onSuccess: () => {
          toast.success(`"${space.name}" archived`);
          // If this was the active space, clear it so the page auto-selects another
          if (activeSpaceId === space.id) {
            setActiveSpace(null);
          }
        },
        onError: () => toast.error('Failed to archive workspace'),
      },
    );
  };

  const handleRestore = () => {
    updateSpace.mutate(
      { id: space.id, isArchived: false },
      {
        onSuccess: () => {
          toast.success(`"${space.name}" restored`);
          setActiveSpace(space.id);
        },
        onError: () => toast.error('Failed to restore workspace'),
      },
    );
  };

  const handleDeleteSpace = () => {
    deleteSpace.mutate(space.id, {
      onSuccess: () => {
        toast.success(`"${space.name}" deleted`);
        if (activeSpaceId === space.id) {
          setActiveSpace(null);
        }
        setIsDeleteDialogOpen(false);
      },
      onError: () => toast.error('Failed to delete workspace'),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            aria-label={`Workspace options for ${space.name}`}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit workspace
          </DropdownMenuItem>

          {space.isArchived ? (
            <DropdownMenuItem onClick={handleRestore}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <EditDialog
        SPACE_ICONS={SPACE_ICONS}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editIcon={editIcon}
        setEditIcon={setEditIcon}
        editName={editName}
        setEditName={setEditName}
        handleUpdateSpace={handleUpdateSpace}
        isPending={updateSpace.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{space.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workspace and all of its content. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteSpace}
              disabled={deleteSpace.isPending}
            >
              {deleteSpace.isPending ? 'Deleting...' : 'Delete workspace'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
