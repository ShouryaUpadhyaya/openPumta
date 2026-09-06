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
  const {
    focusedTextBoxId,
    setFocusedTextBox,
    setDraggingTextBox,
    fullscreenTextBoxId,
    setFullscreenTextBox,
  } = useWorkspaceStore();

  const isFullscreen = fullscreenTextBoxId === textBox.id;

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

  const currentWidth = typeof layout.width === 'number' ? layout.width : 400;
  const currentHeight = typeof layout.height === 'number' ? layout.height : 300;

  const serverSize = useMemo(
    () => ({ width: isMobile ? '100%' : currentWidth, height: isMobile ? 'auto' : currentHeight }),
    [currentWidth, currentHeight, isMobile],
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
    if (isMobile) return;
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
  }, [isMobile]);

  const effectiveHeight = Math.max(MIN_HEIGHT, savedHeight, contentHeight);

  // Auto-save height if content pushes it larger than saved layout
  useEffect(() => {
    if (isMobile || isInteracting || contentHeight <= savedHeight) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateLayout.mutate({
        id: textBox.id,
        spaceId,
        layout: {
          ...textBox.layout,
          [viewport]: {
            ...layout,
            height: contentHeight,
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
    isMobile,
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
      disableDragging={isMobile || isFullscreen}
      enableResizing={isMobile || isFullscreen ? false : true}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      minWidth={isMobile ? '100%' : MIN_WIDTH}
      minHeight={isFullscreen ? '100vh' : Math.max(MIN_HEIGHT, contentHeight)}
      maxWidth={isFullscreen ? '100vw' : MAX_WIDTH}
      maxHeight={isFullscreen ? '100vh' : MAX_HEIGHT}
      bounds={isFullscreen ? undefined : 'parent'}
      onMouseDown={() => setFocusedTextBox(textBox.id)}
      className={`rounded-xl border bg-card flex flex-col group ${
        !isInteracting ? 'transition-all duration-300 ease-in-out' : ''
      } ${
        isFullscreen
          ? '!fixed !inset-0 !z-[100] !w-[100vw] !h-[100vh] !rounded-none !border-none !bg-background !transform-none'
          : isFocused
            ? 'z-50 border-primary/40 shadow-md shadow-primary/10'
            : 'z-10 border-border/50 hover:border-border/80'
      } ${isMobile && !isFullscreen ? '!relative !transform-none !h-auto shrink-0' : ''}`}
      dragHandleClassName="drag-handle"
    >
      {/* ── Toolbar (hover-reveal or fullscreen) ── */}
      <div
        className={`h-8 flex items-center justify-between px-2 border-b border-border/30 shrink-0 ${isFullscreen ? 'bg-background' : 'bg-muted/20 opacity-0 group-hover:opacity-100'}`}
        style={{ transition: 'opacity 0.15s' }}
      >
        <div
          className="drag-handle cursor-grab active:cursor-grabbing flex items-center gap-1 text-muted-foreground hover:text-foreground px-1 py-1 rounded"
          {...(isMobile ? listeners : {})}
          {...(isMobile ? attributes : {})}
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

      {/* ── Editor ── */}
      <div
        ref={contentRef}
        onPaste={handlePaste}
        className="flex-1 p-2 cursor-text overflow-y-auto overflow-x-hidden min-h-0 break-words"
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
