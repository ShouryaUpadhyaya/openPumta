'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { TextBox } from '@/types/space';
import BlockEditor from './BlockEditor';
import { useUpdateTextBoxLayout, useDeleteTextBox, useMoveTextBox } from '@/hooks/useTextBoxes';
import { Trash2, ArrowRightLeft } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { toast } from 'sonner';
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
  const moveTextBox = useMoveTextBox();
  const { focusedTextBoxId, setFocusedTextBox, setDragOverSpaceId, setActiveSpace } =
    useWorkspaceStore();

  const layout = textBox.layout?.[viewport] ||
    textBox.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };
  const isMobile = viewport === 'mobile';

  // Track whether the user is actively dragging or resizing
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isInteracting = isDragging || isResizing;

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

  const handleDrag = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      // e.clientX / clientY are available for mouse and touch events
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const target = document.elementFromPoint(clientX, clientY);
      const targetSpaceIdStr = target
        ?.closest('[data-space-target]')
        ?.getAttribute('data-space-target');

      if (targetSpaceIdStr) {
        const targetSpaceId = Number(targetSpaceIdStr);
        if (targetSpaceId !== spaceId) {
          setDragOverSpaceId(targetSpaceId);
          return;
        }
      }
      setDragOverSpaceId(null);
    },
    [setDragOverSpaceId, spaceId],
  );

  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any, d: { x: number; y: number }) => {
      setIsDragging(false);
      setDragOverSpaceId(null);
      if (isMobile) return;

      const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX;
      const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY;

      let targetSpaceIdStr = null;
      if (clientX !== undefined && clientY !== undefined) {
        const target = document.elementFromPoint(clientX, clientY);
        targetSpaceIdStr = target
          ?.closest('[data-space-target]')
          ?.getAttribute('data-space-target');
      }

      // Case 1: Dropped on a different space tab
      if (targetSpaceIdStr) {
        const targetSpaceId = Number(targetSpaceIdStr);
        if (targetSpaceId !== spaceId) {
          moveTextBox.mutate(
            { id: textBox.id, sourceSpaceId: spaceId, targetSpaceId },
            {
              onSuccess: () => {
                toast.success('Moved text box to another space');
                setActiveSpace(targetSpaceId);
              },
              onError: () => {
                toast.error('Failed to move text box');
                setLocalOverride(null); // Snap back on error
              },
            },
          );
          return; // Do not update local layout
        }
      }

      // Case 2: Dropped outside the canvas (e.g. in the nav area but not on a tab)
      // Restore to original position without firing layout update
      if (d.y < 0) {
        setLocalOverride(null);
        return;
      }

      // Case 3: Normal drop within canvas
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
    [
      isMobile,
      serverSize,
      updateLayout,
      moveTextBox,
      textBox.id,
      textBox.layout,
      spaceId,
      viewport,
      layout,
      setDragOverSpaceId,
      setActiveSpace,
    ],
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

  return (
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
      bounds={undefined}
      onDrag={handleDrag}
      onMouseDown={() => setFocusedTextBox(textBox.id)}
      className={`bg-[#1f1f1f] rounded-xl border border-border shadow-sm group hover:shadow-md transition-shadow flex flex-col ${isFocused ? 'z-50 ring-1 ring-primary/30' : 'z-10'} ${isMobile ? 'relative! transform-none! h-auto! min-h-fit1 shrink-0' : 'min-h-fit!'}`}
      dragHandleClassName="drag-handle"
    >
      <div className="h-8 flex items-center justify-end px-3 border-b border-border/50 bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-0.5 w-full">
          <div className="flex-1 flex items-center">
            {/* Left side empty or add other actions here */}
          </div>
          <div
            className="drag-handle text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted cursor-grab active:cursor-grabbing"
            title="Drag to reposition or move to another space"
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
}
