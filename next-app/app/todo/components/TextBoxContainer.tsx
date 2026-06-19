'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { TextBox } from '@/types/space';
import BlockEditor from './BlockEditor';
import { useUpdateTextBoxLayout, useDeleteTextBox } from '@/hooks/useTextBoxes';
import { GripHorizontal, Trash2, ArrowRightLeft } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Viewport } from '@/hooks/useViewport';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const { focusedTextBoxId, setFocusedTextBox, setDraggingTextBox } = useWorkspaceStore();

  const layout = textBox.layout?.[viewport] ||
    textBox.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };
  const isMobile = viewport === 'mobile';

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: textBox.id,
  });

  // Track whether the user is actively dragging or resizing
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isInteracting = isDragging || isResizing;

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isMobile ? { position: 'relative', zIndex: isDragging ? 50 : 10 } : {}),
  } as React.CSSProperties;

  // Server-derived position/size (recalculates when layout props change)
  const serverPos = useMemo(
    () => ({ x: isMobile ? 0 : layout.x, y: isMobile ? 0 : layout.y }),
    [layout.x, layout.y, isMobile],
  );
  const serverSize = useMemo(
    () => ({ width: isMobile ? '100%' : layout.width, height: isMobile ? 'auto' : layout.height }),
    [layout.width, layout.height, isMobile],
  );

  // Local override: set on drag/resize stop for instant feedback until server data arrives
  const [localOverride, setLocalOverride] = useState<{
    pos: { x: number; y: number };
    size: { width: number | string; height: number | string };
  } | null>(null);

  // When server data changes (after mutation settles), clear any stale local override
  const layoutKey = `${layout.x}-${layout.y}-${layout.width}-${layout.height}`;
  const [prevLayoutKey, setPrevLayoutKey] = useState(layoutKey);
  if (layoutKey !== prevLayoutKey) {
    setPrevLayoutKey(layoutKey);
    setLocalOverride(null);
  }

  // When NOT interacting, use local override (if set) or server values
  // When interacting, pass undefined so react-rnd manages its own DOM transforms freely
  const pos = isInteracting ? undefined : (localOverride?.pos ?? serverPos);
  const size = isInteracting ? undefined : (localOverride?.size ?? serverSize);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setFocusedTextBox(textBox.id);
  }, [setFocusedTextBox, textBox.id]);

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      setIsDragging(false);
      if (isMobile) return;
      setLocalOverride((prev) => ({ pos: { x: d.x, y: d.y }, size: prev?.size ?? serverSize }));
      updateLayout.mutate({
        id: textBox.id,
        spaceId,
        layout: {
          ...textBox.layout,
          [viewport]: { ...layout, x: d.x, y: d.y },
        },
      });
    },
    [isMobile, serverSize, updateLayout, textBox.id, textBox.layout, spaceId, viewport, layout],
  );

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeStop = useCallback(
    (
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
      setIsResizing(false);
      if (isMobile) return;
      const newWidth = parseInt(ref.style.width, 10);
      const newHeight = parseInt(ref.style.height, 10);
      setLocalOverride({
        pos: { x: position.x, y: position.y },
        size: { width: newWidth, height: newHeight },
      });

      updateLayout.mutate({
        id: textBox.id,
        spaceId,
        layout: {
          ...textBox.layout,
          [viewport]: {
            x: position.x,
            y: position.y,
            width: newWidth,
            height: newHeight,
          },
        },
      });
    },
    [isMobile, updateLayout, textBox.id, textBox.layout, spaceId, viewport],
  );

  const isFocused = focusedTextBoxId === textBox.id;

  const rndContent = (
    <Rnd
      default={{
        x: isMobile ? 0 : layout.x,
        y: isMobile ? 0 : layout.y,
        width: isMobile ? '100%' : layout.width,
        height: layout.height,
      }}
      {...(pos ? { position: pos } : {})}
      {...(size ? { size: size } : {})}
      disableDragging={isMobile}
      enableResizing={isMobile ? false : true}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      minWidth={isMobile ? '100%' : 300}
      minHeight={150}
      bounds="parent"
      onMouseDown={() => setFocusedTextBox(textBox.id)}
      className={`bg-[#1f1f1f] min-h-fit! h-fit! rounded-xl border border-border shadow-sm group hover:shadow-md transition-shadow flex flex-col ${isFocused ? 'z-50 ring-1 ring-primary/30' : 'z-10'} ${isMobile ? 'relative! transform-none! h-auto!  shrink-0' : 'min-h-fit!'}`}
      dragHandleClassName="drag-handle"
    >
      <div className="h-8 flex items-center justify-between px-3 border-b border-border/50 bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className="drag-handle cursor-grab active:cursor-grabbing flex-1 h-full flex items-center"
          {...(isMobile ? listeners : {})}
          {...(isMobile ? attributes : {})}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-0.5">
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                'application/textbox-move',
                JSON.stringify({ textBoxId: textBox.id, sourceSpaceId: spaceId }),
              );
              e.dataTransfer.effectAllowed = 'move';
              setDraggingTextBox({ id: textBox.id, spaceId });
            }}
            onDragEnd={() => {
              setDraggingTextBox(null);
            }}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted cursor-move"
            title="Drag to another space"
          >
            <ArrowRightLeft className="h-4 w-4" />
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
      </div>
      <div className="flex-1 p-2 overflow-y-auto cursor-text min-h-25 lg:min-h-75">
        <BlockEditor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialContent={textBox.content as any[]}
          textBoxId={textBox.id}
          spaceId={spaceId}
        />
      </div>
    </Rnd>
  );

  if (isMobile) {
    return (
      <div ref={setNodeRef} style={sortableStyle} className="w-full">
        {rndContent}
      </div>
    );
  }

  return rndContent;
}
