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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditDialog from './EditDialog';

const SPACE_ICONS = ['📋', '🏠', '💼', '🎓', '💻', '🏋️', '🎯', '📚', '🧪', '🌟'];

interface SpaceSettingsMenuProps {
  space: Space;
}

export function SpaceSettingsMenu({ space }: SpaceSettingsMenuProps) {
  const updateSpace = useUpdateSpace();
  const deleteSpace = useDeleteSpace();
  const { setActiveSpace } = useWorkspaceStore();

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
          toast.success('Space updated');
          setIsEditDialogOpen(false);
        },
        onError: () => {
          toast.error('Failed to update space');
        },
      },
    );
  };

  const handleDeleteSpace = () => {
    deleteSpace.mutate(space.id, {
      onSuccess: () => {
        toast.success('Space deleted');
        // Clear active space so it auto-selects another one
        setActiveSpace(0);
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete space');
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Space
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Space
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the space &quot;{space.name}&quot; and all of its columns
              and tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteSpace}
              disabled={deleteSpace.isPending}
            >
              {deleteSpace.isPending ? 'Deleting...' : 'Delete Space'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
