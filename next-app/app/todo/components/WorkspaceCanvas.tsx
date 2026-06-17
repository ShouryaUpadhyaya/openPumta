'use client';

import React, { useRef, useMemo } from 'react';
import { useTextBoxes, useCreateTextBox, useUpdateTextBoxLayout } from '@/hooks/useTextBoxes';
import TextBoxContainer from './TextBoxContainer';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useViewport } from '@/hooks/useViewport';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Placement constants
const BOX_WIDTH = 400;
const BOX_HEIGHT = 300;
const PADDING = 20;
const SPACING = 20;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Check if two rects overlap (with spacing gap) */
function overlaps(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width + SPACING <= b.x ||
    b.x + b.width + SPACING <= a.x ||
    a.y + a.height + SPACING <= b.y ||
    b.y + b.height + SPACING <= a.y
  );
}

/** Check if a rect fits within canvas bounds (with padding) */
function fitsInCanvas(rect: Rect, canvasW: number, canvasH: number): boolean {
  return (
    rect.x >= PADDING &&
    rect.y >= PADDING &&
    rect.x + rect.width <= canvasW - PADDING &&
    rect.y + rect.height <= canvasH - PADDING
  );
}

/** Returns true if the candidate doesn't overlap any existing box */
function isValid(candidate: Rect, existing: Rect[], canvasW: number, canvasH: number): boolean {
  if (!fitsInCanvas(candidate, canvasW, canvasH)) return false;
  return !existing.some((box) => overlaps(candidate, box));
}

/** Smart placement: tries right → left → below → center */
function findPlacement(
  existing: Rect[],
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  const candidate: Rect = { x: 0, y: 0, width: BOX_WIDTH, height: BOX_HEIGHT };

  if (existing.length === 0) {
    return { x: PADDING, y: PADDING };
  }

  // Try RIGHT of each existing box (sorted by rightmost first for better packing)
  const byRight = [...existing].sort((a, b) => b.x + b.width - (a.x + a.width));
  for (const box of byRight) {
    candidate.x = box.x + box.width + SPACING;
    candidate.y = box.y;
    if (isValid(candidate, existing, canvasW, canvasH)) {
      return { x: candidate.x, y: candidate.y };
    }
  }

  // Try LEFT of each existing box (sorted by leftmost first)
  const byLeft = [...existing].sort((a, b) => a.x - b.x);
  for (const box of byLeft) {
    candidate.x = box.x - BOX_WIDTH - SPACING;
    candidate.y = box.y;
    if (isValid(candidate, existing, canvasW, canvasH)) {
      return { x: candidate.x, y: candidate.y };
    }
  }

  // Try BELOW all existing boxes
  let maxY = 0;
  for (const box of existing) {
    maxY = Math.max(maxY, box.y + box.height);
  }
  candidate.x = PADDING;
  candidate.y = maxY + SPACING;
  // Below always works (canvas can scroll), so skip bounds check for Y
  if (candidate.x + candidate.width <= canvasW - PADDING) {
    return { x: candidate.x, y: candidate.y };
  }

  // CENTER fallback
  return {
    x: Math.max(PADDING, (canvasW - BOX_WIDTH) / 2),
    y: maxY + SPACING,
  };
}

export default function WorkspaceCanvas() {
  const { activeSpaceId } = useWorkspaceStore();
  const { data: textBoxes, isLoading } = useTextBoxes(activeSpaceId as number);
  const createTextBox = useCreateTextBox();
  const updateLayout = useUpdateTextBoxLayout();
  const viewport = useViewport();
  const canvasRef = useRef<HTMLDivElement>(null);

  const sortedTextBoxes = useMemo(() => {
    if (!textBoxes) return [];
    if (viewport !== 'mobile') return textBoxes;

    return [...textBoxes].sort((a, b) => {
      const orderA = a.layout?.mobile?.order ?? 0;
      const orderB = b.layout?.mobile?.order ?? 0;
      return orderA - orderB;
    });
  }, [textBoxes, viewport]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTextBoxes.findIndex((t) => t.id === active.id);
    const newIndex = sortedTextBoxes.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(sortedTextBoxes, oldIndex, newIndex);

    // Update backend for items that moved
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
    const canvasEl = canvasRef.current;
    const canvasW = canvasEl?.clientWidth ?? 1200;
    const canvasH = canvasEl?.clientHeight ?? 800;

    // Collect existing box rects for the current viewport
    const existingRects: Rect[] = (textBoxes ?? []).map((box) => {
      const l = box.layout?.[viewport] ||
        box.layout?.desktop || { x: 0, y: 0, width: 400, height: 300 };
      return {
        x: l.x || 0,
        y: l.y || 0,
        width: typeof l.width === 'number' ? l.width : 400,
        height: l.height || 300,
      };
    });

    const { x, y } = findPlacement(existingRects, canvasW, canvasH);

    createTextBox.mutate({
      spaceId: activeSpaceId as number,
      layout: {
        desktop: { x, y, width: BOX_WIDTH, height: BOX_HEIGHT },
        tablet: { x: Math.min(x, 20), y, width: 350, height: BOX_HEIGHT },
        mobile: { x: 0, y, width: '100%', height: BOX_HEIGHT, order: textBoxes?.length ?? 0 },
      },
    });
  };

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 min-w-fit  min-h-full overflow-hidden bg-dot-pattern bg-size-[24px_24px]"
    >
      <div
        className={
          viewport === 'mobile'
            ? 'absolute inset-0 w-fit h-full overflow-y-auto flex flex-col gap-4 p-4 pb-24'
            : 'absolute inset-0 w-full h-full'
        }
      >
        {viewport === 'mobile' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTextBoxes.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedTextBoxes.map((box) => (
                <TextBoxContainer
                  key={box.id}
                  textBox={box}
                  spaceId={activeSpaceId as number}
                  viewport={viewport}
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
