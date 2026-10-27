'use client';

import React, { useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useStopwatchStore } from '@/store/useStopwatchStore';
import Stopwatch from './Stopwatch';

const EDGE_GAP = 8; // px kept between the stopwatch and the edge of its area

type Position = { x: number; y: number };

/**
 * The separate stopwatch, draggable by its grip anywhere inside the nearest `[data-stopwatch-area]`
 * ancestor. Until it's moved it sits in the normal page flow; once dropped it floats at the saved
 * spot, stored as fractions of the free space so it stays on screen when the window resizes.
 * Double-click the grip to put it back.
 */
export function MovableStopwatch({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const saved = useStopwatchStore((s) => s.position);
  const setPosition = useStopwatchStore((s) => s.setPosition);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerX: number; pointerY: number; left: number; top: number } | null>(
    null,
  );
  const [live, setLive] = useState<Position | null>(null);

  const position = live ?? saved;

  const measure = () => {
    const el = ref.current;
    const area = el?.closest<HTMLElement>('[data-stopwatch-area]');
    if (!el || !area) return null;
    const a = area.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      a,
      r,
      freeW: Math.max(1, a.width - r.width - EDGE_GAP * 2),
      freeH: Math.max(1, a.height - r.height - EDGE_GAP * 2),
    };
  };

  const toFraction = (left: number, top: number, m: NonNullable<ReturnType<typeof measure>>) => ({
    x: Math.min(1, Math.max(0, (left - EDGE_GAP) / m.freeW)),
    y: Math.min(1, Math.max(0, (top - EDGE_GAP) / m.freeH)),
  });

  const onPointerDown = (e: React.PointerEvent) => {
    const m = measure();
    if (!m) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const left = m.r.left - m.a.left;
    const top = m.r.top - m.a.top;
    drag.current = { pointerX: e.clientX, pointerY: e.clientY, left, top };
    setLive(toFraction(left, top, m));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const m = d && measure();
    if (!d || !m) return;
    setLive(toFraction(d.left + e.clientX - d.pointerX, d.top + e.clientY - d.pointerY, m));
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (live) setPosition(live);
    setLive(null);
  };

  const handle = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Move stopwatch"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={() => setPosition(null)}
          className="rounded-full cursor-grab active:cursor-grabbing touch-none text-muted-foreground/60"
        >
          <GripVertical />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Drag to move · double-click to reset</TooltipContent>
    </Tooltip>
  );

  // `left: x%` + `translate(-x%)` maps x=0 to flush-left and x=1 to flush-right without
  // knowing the stopwatch's own size (same for y).
  const floatingStyle: React.CSSProperties | undefined = position
    ? {
        position: 'absolute',
        left: `calc(${EDGE_GAP}px + (100% - ${EDGE_GAP * 2}px) * ${position.x})`,
        top: `calc(${EDGE_GAP}px + (100% - ${EDGE_GAP * 2}px) * ${position.y})`,
        transform: `translate(${-position.x * 100}%, ${-position.y * 100}%)`,
        zIndex: 30,
      }
    : undefined;

  return (
    <div
      ref={ref}
      style={floatingStyle}
      // w-max: an absolutely positioned box near the edge would otherwise shrink and wrap the label
      className={cn('shrink-0 w-max', live && 'shadow-xl rounded-full')}
    >
      <Stopwatch variant={variant} handle={handle} />
    </div>
  );
}
