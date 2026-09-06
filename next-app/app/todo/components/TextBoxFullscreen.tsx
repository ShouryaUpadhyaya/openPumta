'use client';

import React, { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useTextBoxes } from '@/hooks/useTextBoxes';
import BlockEditor from './BlockEditor';
import { Button } from '@/components/ui/button';
import { Minimize2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface TextBoxFullscreenProps {
  spaceId: number;
  spaceName: string;
  spaceIcon?: string | null;
}

export function TextBoxFullscreen({ spaceId, spaceName, spaceIcon }: TextBoxFullscreenProps) {
  const { fullscreenTextBoxId, setFullscreenTextBox } = useWorkspaceStore();
  const { data: textBoxes } = useTextBoxes(spaceId);
  const queryClient = useQueryClient();

  const textBox = textBoxes?.find((b) => b.id === fullscreenTextBoxId);
  const isOpen = !!fullscreenTextBoxId && !!textBox;

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setFullscreenTextBox(null);
    // Refresh the textbox data so the regular card shows updated content
    queryClient.invalidateQueries({ queryKey: ['textBoxes', spaceId] });
  };

  if (!isOpen || !textBox) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in-0 duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen editor"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {spaceIcon && <span className="text-lg leading-none shrink-0">{spaceIcon}</span>}
          <span className="text-sm font-medium text-muted-foreground truncate">{spaceName}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
            aria-label="Exit fullscreen (Escape)"
            title="Exit fullscreen (Esc)"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
            aria-label="Close fullscreen"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <BlockEditor
            initialContent={textBox.content as any[]}
            textBoxId={textBox.id}
            spaceId={spaceId}
          />
        </div>
      </div>
    </div>
  );
}
