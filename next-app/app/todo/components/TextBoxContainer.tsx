'use client';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { TextBox } from '@/types/space';
import BlockEditor from './BlockEditor';
import { useUpdateTextBoxLayout, useDeleteTextBox } from '@/hooks/useTextBoxes';
import { GripHorizontal, Trash2, ArrowRightLeft, Maximize2 } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Viewport } from '@/hooks/useViewport';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TOOLBAR_HEIGHT = 32; // px — height of the hover toolbar
const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;

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
  const { focusedTextBoxId, setFocusedTextBox, setDraggingTextBox, setFullscreenTextBox } =
    useWorkspaceStore();

  const layout = textBox.layout?.[viewport] ||
    textBox.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };
  const isMobile = viewport === 'mobile';

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: textBox.id,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isInteracting = isDragging || isResizing;

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isMobile ? { position: 'relative', zIndex: isDragging ? 50 : 10 } : {}),
  } as React.CSSProperties;

  const serverPos = useMemo(
    () => ({ x: isMobile ? 0 : layout.x, y: isMobile ? 0 : layout.y }),
    [layout.x, layout.y, isMobile],
  );

  // Make sure we have numbers for width/height (fallbacks to defaults)
  const currentWidth = typeof layout.width === 'number' ? layout.width : 400;
  const currentHeight = typeof layout.height === 'number' ? layout.height : 300;

  const serverSize = useMemo(
    () => ({ width: isMobile ? '100%' : currentWidth, height: isMobile ? 'auto' : currentHeight }),
    [currentWidth, currentHeight, isMobile],
  );

  // Local override: set on drag/resize stop for instant feedback
  const [localOverride, setLocalOverride] = useState<{
    pos: { x: number; y: number };
    size: { width: number | string; height: number | string };
  } | null>(null);

  // Clear local override when server data updates
  const layoutKey = `${layout.x}-${layout.y}-${layout.width}-${layout.height}`;
  const [prevLayoutKey, setPrevLayoutKey] = useState(layoutKey);
  if (layoutKey !== prevLayoutKey) {
    setPrevLayoutKey(layoutKey);
    setLocalOverride(null);
  }

  const contentRef = useRef<HTMLDivElement>(null);

  // Current pos/size for Rnd
  const pos = isInteracting ? undefined : (localOverride?.pos ?? serverPos);
  const effectiveSizeForRnd = isInteracting
    ? undefined
    : {
        width: localOverride?.size.width ?? serverSize.width,
        height: localOverride?.size.height ?? serverSize.height,
      };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setFocusedTextBox(textBox.id);
  }, [setFocusedTextBox, textBox.id]);

  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any, d: { x: number; y: number }) => {
      setIsDragging(false);
      if (isMobile) return;
      setLocalOverride((prev) => ({
        pos: { x: d.x, y: d.y },
        size: prev?.size ?? serverSize,
      }));
      updateLayout.mutate({
        id: textBox.id,
        spaceId,
        layout: {
          ...textBox.layout,
          [viewport]: { ...layout, x: d.x, y: d.y, positionSource: 'user' },
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
            ...layout,
            x: position.x,
            y: position.y,
            width: newWidth,
            height: newHeight,
            positionSource: 'user',
          },
        },
      });
    },
    [isMobile, updateLayout, textBox.id, textBox.layout, spaceId, viewport, layout],
  );

  // ── Auto-Resize on Paste ─────────────────────────────────────────────────────

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (isMobile) return;

      // We only trigger auto-resize logic if we can read the pasted text
      const text = e.clipboardData.getData('text/plain');
      if (!text) return;

      // 1. Calculate estimated required width based on longest line
      const lines = text.split('\n');
      const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '');
      const approxCharWidth = 8.5; // pixels per character
      const padding = 64; // left/right padding + margins

      // Width can expand up to MAX_WIDTH, but never shrink below current
      const calculatedWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, longestLine.length * approxCharWidth + padding),
      );
      const finalWidth = Math.max(currentWidth, calculatedWidth);

      // 2. Wait for DOM to render the pasted content to get actual height
      setTimeout(() => {
        if (!contentRef.current) return;

        // BlockNote might have expanded the scrollHeight
        const actualScrollHeight = contentRef.current.scrollHeight;

        // Height can expand up to MAX_HEIGHT, but never shrink below current
        const calculatedHeight = Math.min(
          MAX_HEIGHT,
          Math.max(MIN_HEIGHT, actualScrollHeight + TOOLBAR_HEIGHT),
        );
        const finalHeight = Math.max(currentHeight, calculatedHeight);

        // Only fire mutation if dimensions actually grew
        if (finalWidth > currentWidth || finalHeight > currentHeight) {
          // Optimistic UI update
          setLocalOverride({
            pos: { x: layout.x, y: layout.y },
            size: { width: finalWidth, height: finalHeight },
          });

          // Persist to backend
          updateLayout.mutate({
            id: textBox.id,
            spaceId,
            layout: {
              ...textBox.layout,
              [viewport]: {
                ...layout,
                width: finalWidth,
                height: finalHeight,
                positionSource: 'auto_paste', // Tag it so we know it wasn't a direct manual drag
              },
            },
          });
        }
      }, 100); // 100ms gives BlockNote time to parse and render the clipboard data
    },
    [
      currentWidth,
      currentHeight,
      isMobile,
      layout,
      spaceId,
      textBox.id,
      textBox.layout,
      updateLayout,
      viewport,
    ],
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
      {...(effectiveSizeForRnd ? { size: effectiveSizeForRnd } : {})}
      disableDragging={isMobile}
      enableResizing={isMobile ? false : true}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      minWidth={isMobile ? '100%' : MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      maxWidth={MAX_WIDTH}
      maxHeight={MAX_HEIGHT}
      bounds="parent"
      onMouseDown={() => setFocusedTextBox(textBox.id)}
      className={`rounded-xl border bg-card flex flex-col group ${
        isFocused
          ? 'z-50 border-primary/40 shadow-md shadow-primary/10'
          : 'z-10 border-border/50 hover:border-border/80'
      } ${isMobile ? 'relative! transform-none! h-auto! shrink-0' : ''}`}
      dragHandleClassName="drag-handle"
    >
      {/* ── Toolbar (hover-reveal) ── */}
      <div
        className="h-8 flex items-center justify-between px-2 border-b border-border/30 bg-muted/20 opacity-0 group-hover:opacity-100 shrink-0"
        style={{ transition: 'opacity 0.15s' }}
      >
        <div
          className="drag-handle cursor-grab active:cursor-grabbing flex items-center gap-1 text-muted-foreground hover:text-foreground px-1 py-1 rounded"
          {...(isMobile ? listeners : {})}
          {...(isMobile ? attributes : {})}
          title="Drag to reposition"
        >
          <GripHorizontal className="h-3.5 w-3.5" />
        </div>

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setFullscreenTextBox(textBox.id)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60"
                aria-label="Expand to fullscreen"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Fullscreen (focus mode)</p>
            </TooltipContent>
          </Tooltip>

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
            onDragEnd={() => setDraggingTextBox(null)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 cursor-move"
            title="Move to another workspace"
            aria-label="Move to another workspace"
            role="button"
            tabIndex={0}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </div>

          <button
            onClick={() => {
              if (confirm('Delete this text box?')) {
                deleteTextBox.mutate({ id: textBox.id, spaceId });
              }
            }}
            className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-muted/60"
            aria-label="Delete text box"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div
        ref={contentRef}
        onPaste={handlePaste}
        className="flex-1 p-2 cursor-text overflow-y-auto overflow-x-hidden min-h-0"
      >
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
