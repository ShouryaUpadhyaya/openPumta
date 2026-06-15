'use client';

import { Rnd } from 'react-rnd';
import { TextBox } from '@/types/space';
import BlockEditor from './BlockEditor';
import { useUpdateTextBoxLayout, useDeleteTextBox } from '@/hooks/useTextBoxes';
import { GripHorizontal, Trash2 } from 'lucide-react';

import { Viewport } from '@/hooks/useViewport';

export default function TextBoxContainer({
  textBox,
  spaceId,
  viewport,
}: {
  textBox: TextBox;
  spaceId: number;
  viewport: Viewport;
}) {
  const updateLayout = useUpdateTextBoxLayout();
  const deleteTextBox = useDeleteTextBox();

  const layout = textBox.layout?.[viewport] ||
    textBox.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };
  const isMobile = viewport === 'mobile';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStop = (e: any, d: { x: number; y: number }) => {
    if (isMobile) return;
    updateLayout.mutate({
      id: textBox.id,
      spaceId,
      layout: {
        ...textBox.layout,
        [viewport]: { ...layout, x: d.x, y: d.y },
      },
    });
  };

  const handleResizeStop = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    direction: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delta: any,
    position: { x: number; y: number },
  ) => {
    updateLayout.mutate({
      id: textBox.id,
      spaceId,
      layout: {
        ...textBox.layout,
        [viewport]: {
          x: isMobile ? 0 : position.x,
          y: isMobile ? 0 : position.y,
          width: isMobile ? '100%' : parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        },
      },
    });
  };

  return (
    <Rnd
      default={{
        x: isMobile ? 0 : layout.x,
        y: isMobile ? 0 : layout.y,
        width: isMobile ? '100%' : layout.width,
        height: layout.height,
      }}
      position={isMobile ? { x: 0, y: 0 } : { x: layout.x, y: layout.y }}
      size={{ width: isMobile ? '100%' : layout.width, height: layout.height }}
      disableDragging={isMobile}
      enableResizing={
        isMobile
          ? {
              bottom: true,
              top: false,
              left: false,
              right: false,
              bottomLeft: false,
              bottomRight: false,
              topLeft: false,
              topRight: false,
            }
          : true
      }
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={isMobile ? '100%' : 300}
      minHeight={150}
      bounds="parent"
      className={`bg-[#1f1f1f] rounded-xl border border-border shadow-sm group hover:shadow-md transition-shadow flex flex-col z-10 ${isMobile ? '!relative !transform-none !w-full shrink-0' : ''}`}
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialContent={textBox.content as any[]}
          textBoxId={textBox.id}
          spaceId={spaceId}
        />
      </div>
    </Rnd>
  );
}
