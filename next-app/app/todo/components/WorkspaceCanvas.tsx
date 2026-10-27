'use client';

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useTextBoxes, useCreateTextBox, useUpdateTextBoxLayout } from '@/hooks/useTextBoxes';
import TextBoxContainer from './TextBoxContainer';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useViewport } from '@/hooks/useViewport';
import { Loader2, Plus, LayoutGrid, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSwappingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useWorkspaceSettingsStore } from '@/store/useWorkspaceSettingsStore';
import {
  calculateAutoLayout,
  computeTiles,
  BOX_WIDTH,
  BOX_HEIGHT,
  PADDING,
} from '@/lib/smartLayout';
import { TextBox } from '@/types/space';
import { toast } from 'sonner';

const pointerSensorOptions = { activationConstraint: { distance: 5 } };

// One order shared by the mobile list and the desktop tiles (stored on layout.mobile for
// backwards compatibility); boxes without one fall back to creation order.
const boxOrder = (box: TextBox) => box.layout?.mobile?.order ?? 0;

export default function WorkspaceCanvas() {
  const { activeSpaceId } = useWorkspaceStore();
  const { data: textBoxes, isLoading } = useTextBoxes(activeSpaceId as number);
  const maxY = useMemo(() => {
    if (!textBoxes || textBoxes.length === 0) return 0;
    return Math.max(
      ...textBoxes.map((box) => {
        const l = box.layout?.desktop || { y: 0, height: 300 };
        return (l.y || 0) + (typeof l.height === 'number' ? l.height : 300);
      }),
    );
  }, [textBoxes]);

  const createTextBox = useCreateTextBox();
  const updateLayout = useUpdateTextBoxLayout();
  const viewport = useViewport();
  const tilingEnabled = useWorkspaceSettingsStore((s) => s.tilingLayout);
  const isTiling = tilingEnabled && viewport !== 'mobile';

  // The canvas element changes between the empty and filled states, so track it with a
  // callback ref and re-tile whenever its size changes (window resize, sidebar toggle).
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const roRef = useRef<ResizeObserver | null>(null);
  const setCanvasEl = useCallback((el: HTMLDivElement | null) => {
    canvasRef.current = el;
    roRef.current?.disconnect();
    if (!el) return;
    const measure = () => setCanvasSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);
  useEffect(() => () => roRef.current?.disconnect(), []);

  const [showAutoLayout, setShowAutoLayout] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const t1 = setTimeout(() => setShowAutoLayout(true), 0);
    const t = setTimeout(() => setShowAutoLayout(false), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t);
    };
  }, [activeSpaceId]);

  const sortedTextBoxes = useMemo(() => {
    if (!textBoxes) return [];
    return [...textBoxes].sort((a, b) => boxOrder(a) - boxOrder(b) || a.id - b.id);
  }, [textBoxes]);

  const tiles = useMemo(
    () =>
      isTiling && canvasSize.width > 0
        ? computeTiles(sortedTextBoxes.length, canvasSize.width, canvasSize.height)
        : [],
    [isTiling, sortedTextBoxes.length, canvasSize.width, canvasSize.height],
  );
  const tilesHeight = tiles.length ? Math.max(...tiles.map((t) => t.y + t.height)) + PADDING : 0;

  const sensors = useSensors(useSensor(PointerSensor, pointerSensorOptions));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTextBoxes.findIndex((t) => t.id === active.id);
    const newIndex = sortedTextBoxes.findIndex((t) => t.id === over.id);

    // Tiles swap places (like a tiling WM); the mobile list shifts items
    const reordered = isTiling
      ? sortedTextBoxes.map((box, i) =>
          i === oldIndex
            ? sortedTextBoxes[newIndex]
            : i === newIndex
              ? sortedTextBoxes[oldIndex]
              : box,
        )
      : arrayMove(sortedTextBoxes, oldIndex, newIndex);

    reordered.forEach((box, index) => {
      if (box.layout?.mobile?.order !== index) {
        updateLayout.mutate({
          id: box.id,
          spaceId: activeSpaceId as number,
          layout: {
            ...box.layout,
            mobile: { ...box.layout?.mobile, order: index },
          },
        });
      }
    });
  };

  if (!activeSpaceId || !isMounted) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
        {!isMounted ? 'Loading workspace...' : 'Select a workspace to view your canvas'}
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
    const canvasEl = canvasRef.current;
    const canvasW = canvasEl?.clientWidth ?? 1200;
    const autoArrange = useWorkspaceSettingsStore.getState().autoArrangeNewTextBoxes;

    let x = PADDING;
    let y = PADDING;
    let width: number | string = BOX_WIDTH;
    let height: number | string = BOX_HEIGHT;
    let positionSource: 'auto' | 'user' = 'user';

    if (autoArrange && viewport !== 'mobile' && !isTiling) {
      const dummyBox = { id: -1, layout: {} } as any;
      const autoBoxes = (textBoxes || []).filter((b) => {
        const l = (b.layout?.[viewport] || b.layout?.desktop) as any;
        return l?.positionSource === 'auto';
      });
      const boxesToDwindle = [...autoBoxes, dummyBox];

      const canvasH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const result = calculateAutoLayout(
        textBoxes || [],
        boxesToDwindle,
        canvasW,
        viewport,
        canvasH,
      );

      if (result.length > 0) {
        const newBoxLayout = result.find((r) => r.id === -1);
        if (newBoxLayout) {
          x = newBoxLayout.layout[viewport].x;
          y = newBoxLayout.layout[viewport].y;
          width = newBoxLayout.layout[viewport].width;
          height = newBoxLayout.layout[viewport].height;
          positionSource = 'auto';
        }

        result.forEach((update) => {
          if (update.id !== -1) {
            updateLayout.mutate({
              id: update.id,
              spaceId: activeSpaceId as number,
              layout: update.layout,
            });
          }
        });
      }
    } else {
      x = Math.max(PADDING, (canvasW - BOX_WIDTH) / 2);
      y = maxY + PADDING;
      positionSource = 'user';
    }

    createTextBox.mutate({
      spaceId: activeSpaceId as number,
      layout: {
        desktop: { x, y, width, height, positionSource },
        tablet: { x: Math.min(x, 20), y, width: 350, height, positionSource },
        mobile: {
          x: 0,
          y,
          width: '100%',
          height,
          order: sortedTextBoxes.length ? boxOrder(sortedTextBoxes.at(-1)!) + 1 : 0,
        },
      },
    });
  };

  const handleReflowAutoBoxes = (arrangeAll = false) => {
    const canvasEl = canvasRef.current;
    const canvasW = canvasEl?.clientWidth ?? 1200;

    let boxesToArrange = textBoxes || [];
    if (!arrangeAll) {
      boxesToArrange = boxesToArrange.filter((b) => {
        const l = b.layout?.[viewport] || b.layout?.desktop;
        return (l as any)?.positionSource === 'auto';
      });
    }

    if (boxesToArrange.length === 0) {
      toast.info('No text boxes to arrange.');
      return;
    }

    const canvasH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const updates = calculateAutoLayout(
      textBoxes || [],
      boxesToArrange,
      canvasW,
      viewport,
      canvasH,
    );

    if (updates.length === 0) {
      toast.success('Already optimally arranged!');
      return;
    }

    updates.forEach((update) => {
      updateLayout.mutate({
        id: update.id,
        spaceId: activeSpaceId as number,
        layout: update.layout,
      });
    });

    toast.success('Workspace auto-arranged!');
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (sortedTextBoxes.length === 0) {
    return (
      <div
        ref={setCanvasEl}
        className="relative flex-1 overflow-y-auto overflow-x-hidden bg-dot-pattern bg-size-[24px_24px]"
      >
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5 text-center px-4">
          {/* Icon */}
          <div className="p-5 rounded-2xl bg-muted/40 text-muted-foreground/60">
            <FileText className="h-10 w-10" />
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-semibold text-foreground">This workspace is empty</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Add a note, plan, idea, or anything you want to keep here.
            </p>
          </div>

          {/* Primary CTA */}
          <Button
            onClick={handleAddTextBox}
            disabled={createTextBox.isPending}
            className="gap-2 shadow-lg shadow-primary/20 px-6"
            size="lg"
          >
            {createTextBox.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create your first block
          </Button>
        </div>
      </div>
    );
  }

  // ── Canvas with text boxes ───────────────────────────────────────────────────
  const isSortable = viewport === 'mobile' || isTiling;

  return (
    <div
      ref={setCanvasEl}
      className="relative flex-1 overflow-y-auto overflow-x-hidden bg-dot-pattern bg-size-[24px_24px]"
    >
      <div
        style={
          viewport === 'mobile'
            ? undefined
            : isTiling
              ? { height: tilesHeight }
              : { minHeight: `calc(max(100vh, ${maxY}px) + 600px)` }
        }
        className={
          viewport === 'mobile'
            ? 'w-full min-h-full flex flex-col gap-4 p-4 pb-24'
            : 'relative w-full'
        }
      >
        {isSortable ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTextBoxes.map((t) => t.id)}
              strategy={isTiling ? rectSwappingStrategy : verticalListSortingStrategy}
            >
              {(viewport === 'mobile' || tiles.length === sortedTextBoxes.length) &&
                sortedTextBoxes.map((box, i) => (
                  <TextBoxContainer
                    key={box.id}
                    textBox={box}
                    spaceId={activeSpaceId as number}
                    viewport={viewport}
                    tile={isTiling ? tiles[i] : undefined}
                  />
                ))}
            </SortableContext>
          </DndContext>
        ) : (
          sortedTextBoxes.map((box) => (
            <TextBoxContainer
              key={box.id}
              textBox={box}
              spaceId={activeSpaceId as number}
              viewport={viewport}
            />
          ))
        )}
      </div>

      {/* ── FAB buttons ── */}
      <div
        className="fixed bottom-28 md:bottom-6 right-6 flex flex-col gap-3 items-end z-50"
        onMouseEnter={() => setShowAutoLayout(true)}
        onMouseLeave={() => setShowAutoLayout(false)}
      >
        <Button
          onClick={() => handleReflowAutoBoxes(true)}
          className={`h-11 w-11 rounded-full shadow-lg transition-all duration-300 ${isTiling ? 'hidden' : ''} ${showAutoLayout ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          size="icon"
          variant="secondary"
          title="Auto-arrange text boxes"
          aria-label="Auto-arrange text boxes"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleAddTextBox}
          disabled={createTextBox.isPending}
          className="h-14 w-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
          size="icon"
          aria-label="Add new text box"
          title="Add text box"
        >
          {createTextBox.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
