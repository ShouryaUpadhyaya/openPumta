'use client';

import { useTextBoxes, useCreateTextBox } from '@/hooks/useTextBoxes';
import TextBoxContainer from './TextBoxContainer';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useViewport } from '@/hooks/useViewport';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WorkspaceCanvas() {
  const { activeSpaceId } = useWorkspaceStore();
  const { data: textBoxes, isLoading } = useTextBoxes(activeSpaceId as number);
  const createTextBox = useCreateTextBox();
  const viewport = useViewport();

  if (!activeSpaceId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
        Select a space to view your canvas
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddTextBox = () => {
    // Generate a new position somewhat randomly to avoid overlapping exactly
    const offset = (textBoxes?.length || 0) * 20;
    createTextBox.mutate({
      spaceId: activeSpaceId,
      layout: {
        desktop: { x: 50 + offset, y: 50 + offset, width: 400, height: 300 },
        tablet: { x: 20 + offset, y: 20 + offset, width: 350, height: 300 },
        mobile: { x: 0, y: 20 + offset, width: '100%', height: 300 },
      },
    });
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-dot-pattern bg-[length:24px_24px]">
      <div
        className={
          viewport === 'mobile'
            ? 'absolute inset-0 w-full h-full overflow-y-auto flex flex-col gap-4 p-4 pb-24'
            : 'absolute inset-0 w-full h-full'
        }
      >
        {textBoxes?.map((box) => (
          <TextBoxContainer
            key={box.id}
            textBox={box}
            spaceId={activeSpaceId}
            viewport={viewport}
          />
        ))}
      </div>

      <Button
        onClick={handleAddTextBox}
        className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
