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
import type { Rect } from '@/lib/smartLayout';

const TOOLBAR_HEIGHT = 32; // px — height of the hover toolbar
const MIN_WIDTH = 300;
const MIN_HEIGHT = 150;
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 800;

type DragHandleProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Renders a text box in one of three modes:
 * - mobile: a full-width card in a sortable list whose height follows its content
 * - tile: a fixed tile from the canvas's tiling layout (drag the handle to swap tiles)
 * - free-form: a draggable/resizable box on the canvas (tiling turned off)
 */
export default function TextBoxContainer({
  textBox,
  spaceId,
  viewport,
  tile,
}: {
  textBox: TextBox;
  spaceId: number;
  viewport: Viewport;
  tile?: Rect;
}) {
  if (viewport === 'mobile' || tile) {
    return <SortableTextBox textBox={textBox} spaceId={spaceId} tile={tile} />;
  }
  return <FreeformTextBox textBox={textBox} spaceId={spaceId} viewport={viewport} />;
}

// ── Shared pieces ──────────────────────────────────────────────────────────────

function useFullscreen(textBoxId: number) {
  const { fullscreenTextBoxId, setFullscreenTextBox } = useWorkspaceStore();
  const isFullscreen = fullscreenTextBoxId === textBoxId;

  // Handle Escape for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenTextBox(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen, setFullscreenTextBox]);

  // Prevent body scroll in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return isFullscreen;
}

function TextBoxToolbar({
  textBox,
  spaceId,
  isFullscreen,
  alwaysVisible,
  dragHandleProps,
}: {
  textBox: TextBox;
  spaceId: number;
  isFullscreen: boolean;
  alwaysVisible?: boolean;
  dragHandleProps?: DragHandleProps;
}) {
  const deleteTextBox = useDeleteTextBox();
  const { setDraggingTextBox, setFullscreenTextBox } = useWorkspaceStore();

  return (
    <div
      className={`h-8 flex items-center justify-between px-2 border-b border-border/30 shrink-0 ${
        isFullscreen
          ? 'bg-background'
          : alwaysVisible
            ? 'bg-muted/20'
            : 'bg-muted/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
      }`}
      style={{ transition: 'opacity 0.15s' }}
    >
      <div
        className="drag-handle cursor-grab active:cursor-grabbing flex items-center gap-1 text-muted-foreground hover:text-foreground px-1 py-1 rounded touch-none"
        {...dragHandleProps}
        title="Drag to reposition"
      >
        {!isFullscreen && <GripHorizontal className="h-3.5 w-3.5" />}
      </div>

      <div className="flex items-center gap-0.5">
        {isFullscreen ? (
          <button
            onClick={() => setFullscreenTextBox(null)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 flex items-center gap-1"
            aria-label="Exit fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="text-xs">Exit Fullscreen</span>
          </button>
        ) : (
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
        )}

        {!isFullscreen && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

function TextBoxEditor({
  textBox,
  spaceId,
  contentRef,
  onPaste,
  scroll,
}: {
  textBox: TextBox;
  spaceId: number;
  contentRef?: React.Ref<HTMLDivElement>;
  onPaste?: React.ClipboardEventHandler<HTMLDivElement>;
  /** Scroll inside the box (fixed-size boxes) instead of growing with the content */
  scroll: boolean;
}) {
  return (
    <div
      ref={contentRef}
      onPaste={onPaste}
      className={`p-2 cursor-text overflow-x-hidden break-words ${
        scroll ? 'flex-1 min-h-0 overflow-y-auto custom-scrollbar' : ''
      }`}
    >
      <BlockEditor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialContent={textBox.content as any[]}
        textBoxId={textBox.id}
        spaceId={spaceId}
      />
    </div>
  );
}

const FULLSCREEN_CLASSES = '!fixed !inset-0 !z-[100] !rounded-none !border-none !bg-background';

// ── Mobile card / desktop tile ─────────────────────────────────────────────────

function SortableTextBox({
  textBox,
  spaceId,
  tile,
}: {
  textBox: TextBox;
  spaceId: number;
  tile?: Rect;
}) {
  const { focusedTextBoxId, setFocusedTextBox } = useWorkspaceStore();
  const isFullscreen = useFullscreen(textBox.id);
  const isFocused = focusedTextBoxId === textBox.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: textBox.id,
  });

  // Tiles are absolutely positioned at their slot; mobile cards flow in the list.
  // A transform would break `position: fixed`, so drop it in fullscreen.
  const style: React.CSSProperties = isFullscreen
    ? {}
    : {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        ...(tile
          ? {
              position: 'absolute',
              left: tile.x,
              top: tile.y,
              width: tile.width,
              height: tile.height,
            }
          : {}),
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseDown={() => setFocusedTextBox(textBox.id)}
      className={`rounded-xl border bg-card flex flex-col group min-w-0 ${
        tile ? 'overflow-hidden' : 'w-full shrink-0'
      } ${tile && !isDragging ? 'transition-[left,top,width,height] duration-300 ease-in-out' : ''} ${
        isFullscreen
          ? FULLSCREEN_CLASSES
          : isDragging
            ? 'border-primary/60 shadow-xl shadow-primary/20 opacity-90'
            : isFocused
              ? 'z-10 border-primary/40 shadow-md shadow-primary/10'
              : 'border-border/50 hover:border-border/80'
      }`}
    >
      <TextBoxToolbar
        textBox={textBox}
        spaceId={spaceId}
        isFullscreen={isFullscreen}
        // Touch screens have no hover, so keep the mobile toolbar visible
        alwaysVisible={!tile}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      <TextBoxEditor textBox={textBox} spaceId={spaceId} scroll={!!tile || isFullscreen} />
    </div>
  );
}

// ── Free-form canvas box ───────────────────────────────────────────────────────

function FreeformTextBox({
  textBox,
  spaceId,
  viewport,
}: {
  textBox: TextBox;
  spaceId: number;
  viewport: Viewport;
}) {
  const updateLayout = useUpdateTextBoxLayout();
  const { focusedTextBoxId, setFocusedTextBox } = useWorkspaceStore();
  const isFullscreen = useFullscreen(textBox.id);

  const layout = textBox.layout?.[viewport] ||
    textBox.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isInteracting = isDragging || isResizing;

  const serverPos = useMemo(() => ({ x: layout.x, y: layout.y }), [layout.x, layout.y]);

  const currentWidth = typeof layout.width === 'number' ? layout.width : 400;
  const currentHeight = typeof layout.height === 'number' ? layout.height : 300;

  const serverSize = useMemo(
    () => ({ width: currentWidth, height: currentHeight }),
    [currentWidth, currentHeight],
  );

  const [localOverride, setLocalOverride] = useState<{
    pos: { x: number; y: number };
    size: { width: number | string; height: number | string };
  } | null>(null);

  const layoutKey = `${layout.x}-${layout.y}-${layout.width}-${layout.height}`;
  const [prevLayoutKey, setPrevLayoutKey] = useState(layoutKey);
  if (layoutKey !== prevLayoutKey) {
    setPrevLayoutKey(layoutKey);
    setLocalOverride(null);
  }

  const contentRef = useRef<HTMLDivElement>(null);

  // ── Height Calculation ────────────────────────────────────────────────────────
  const savedHeight = typeof layout.height === 'number' ? layout.height : MIN_HEIGHT;
  const [contentHeight, setContentHeight] = useState<number>(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !el.firstElementChild) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // content height + toolbar height + small buffer
        const measured = Math.round(entry.contentRect.height) + TOOLBAR_HEIGHT + 8;
        setContentHeight(measured);
      }
    });
    ro.observe(el.firstElementChild);

    return () => ro.disconnect();
  }, []);

  const effectiveHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, savedHeight, contentHeight));

  // Auto-save height if content pushes it larger than saved layout
  useEffect(() => {
    if (isInteracting || contentHeight <= savedHeight || savedHeight >= MAX_HEIGHT) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateLayout.mutate({
        id: textBox.id,
        spaceId,
        layout: {
          ...textBox.layout,
          [viewport]: {
            ...layout,
            height: Math.min(MAX_HEIGHT, contentHeight),
            positionSource: (layout as any).positionSource === 'user' ? 'user' : 'auto_paste',
          },
        },
      });
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    contentHeight,
    savedHeight,
    isInteracting,
    layout,
    spaceId,
    textBox.id,
    textBox.layout,
    updateLayout,
    viewport,
  ]);

  const pos = isFullscreen
    ? { x: 0, y: 0 }
    : isInteracting
      ? undefined
      : (localOverride?.pos ?? serverPos);

  const effectiveSizeForRnd = isFullscreen
    ? {
        width: typeof window !== 'undefined' ? window.innerWidth : '100vw',
        height: typeof window !== 'undefined' ? window.innerHeight : '100vh',
      }
    : isInteracting
      ? undefined
      : {
          width: localOverride?.size.width ?? serverSize.width,
          height: effectiveHeight,
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
    [serverSize, updateLayout, textBox.id, textBox.layout, spaceId, viewport, layout],
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
    [updateLayout, textBox.id, textBox.layout, spaceId, viewport, layout],
  );

  // ── Auto-Resize on Paste ─────────────────────────────────────────────────────

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text/plain');
      if (!text) return;

      const lines = text.split('\n');
      const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '');
      const approxCharWidth = 8.5;
      const padding = 64;

      const dynamicMaxWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : MAX_WIDTH;
      const calculatedWidth = Math.min(
        dynamicMaxWidth,
        Math.max(MIN_WIDTH, longestLine.length * approxCharWidth + padding),
      );
      const finalWidth = Math.max(currentWidth, calculatedWidth);

      if (finalWidth > currentWidth) {
        setLocalOverride((prev) => ({
          pos: prev?.pos ?? { x: layout.x, y: layout.y },
          size: { width: finalWidth, height: prev?.size.height ?? currentHeight },
        }));

        updateLayout.mutate({
          id: textBox.id,
          spaceId,
          layout: {
            ...textBox.layout,
            [viewport]: {
              ...layout,
              width: finalWidth,
              positionSource: (layout as any).positionSource === 'user' ? 'user' : 'auto_paste',
            },
          },
        });
      }
    },
    [
      currentWidth,
      currentHeight,
      layout,
      spaceId,
      textBox.id,
      textBox.layout,
      updateLayout,
      viewport,
    ],
  );

  const isFocused = focusedTextBoxId === textBox.id;

  return (
    <Rnd
      default={{
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      }}
      {...(pos ? { position: pos } : {})}
      {...(effectiveSizeForRnd ? { size: effectiveSizeForRnd } : {})}
      disableDragging={isFullscreen}
      enableResizing={!isFullscreen}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      minWidth={MIN_WIDTH}
      minHeight={isFullscreen ? '100vh' : MIN_HEIGHT}
      maxWidth={isFullscreen ? '100vw' : MAX_WIDTH}
      maxHeight={isFullscreen ? '100vh' : MAX_HEIGHT}
      bounds={isFullscreen ? undefined : 'parent'}
      onMouseDown={() => setFocusedTextBox(textBox.id)}
      className={`rounded-xl border bg-card flex flex-col group overflow-hidden ${
        !isInteracting ? 'transition-all duration-300 ease-in-out' : ''
      } ${
        isFullscreen
          ? `${FULLSCREEN_CLASSES} !w-[100vw] !h-[100vh] !transform-none`
          : isFocused
            ? 'z-50 border-primary/40 shadow-md shadow-primary/10'
            : 'z-10 border-border/50 hover:border-border/80'
      }`}
      dragHandleClassName="drag-handle"
    >
      <TextBoxToolbar textBox={textBox} spaceId={spaceId} isFullscreen={isFullscreen} />
      <TextBoxEditor
        textBox={textBox}
        spaceId={spaceId}
        contentRef={contentRef}
        onPaste={handlePaste}
        scroll
      />
    </Rnd>
  );
}
