'use client';

import { Rnd } from 'react-rnd';
import { TextBox } from '@/types/space';
import BlockEditor from './BlockEditor';
import { useUpdateTextBoxLayout, useDeleteTextBox } from '@/hooks/useTextBoxes';
import { GripHorizontal, Trash2 } from 'lucide-react';

export default function TextBoxContainer({
  textBox,
  spaceId,
}: {
  textBox: TextBox;
  spaceId: number;
}) {
  const updateLayout = useUpdateTextBoxLayout();
  const deleteTextBox = useDeleteTextBox();

  const layout = textBox.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };

  const handleDragStop = (e: any, d: { x: number; y: number }) => {
    updateLayout.mutate({
      id: textBox.id,
      spaceId,
      layout: {
        ...textBox.layout,
        desktop: { ...layout, x: d.x, y: d.y },
      },
    });
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: any,
    delta: any,
    position: { x: number; y: number },
  ) => {
    updateLayout.mutate({
      id: textBox.id,
      spaceId,
      layout: {
        ...textBox.layout,
        desktop: {
          x: position.x,
          y: position.y,
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        },
      },
    });
  };

  return (
    <Rnd
      default={{
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      }}
      position={{ x: layout.x, y: layout.y }}
      size={{ width: layout.width, height: layout.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={300}
      minHeight={150}
      bounds="parent"
      className="bg-background rounded-xl border border-border shadow-sm group hover:shadow-md transition-shadow flex flex-col z-10"
      dragHandleClassName="drag-handle"
    >
      <div className="h-8 flex items-center justify-between px-3 border-b border-border/50 bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="drag-handle cursor-grab active:cursor-grabbing flex-1 h-full flex items-center">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
        <button
          onClick={() => {
            if (confirm('Delete this text box?')) {
              deleteTextBox.mutate({ id: textBox.id, spaceId });
            }
          }}
          className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-muted"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 p-2 overflow-hidden cursor-text">
        <BlockEditor
          initialContent={textBox.content as any[]}
          textBoxId={textBox.id}
          spaceId={spaceId}
        />
      </div>
    </Rnd>
  );
}
