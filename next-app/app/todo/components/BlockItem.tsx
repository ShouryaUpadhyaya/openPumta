'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block, BlockType } from '@/hooks/useBlocks';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockItemProps {
  block: Block;
  onUpdate: (updates: Partial<Block> & { id: number; columnId: number }) => void;
  onDelete: (id: number) => void;
}

function BlockLabel({ type }: { type: BlockType }) {
  const labels: Record<BlockType, string> = {
    HEADING: 'HEADING',
    PARAGRAPH: 'PARAGRAPH',
    TODO: 'TODO',
    DIVIDER: 'DIVIDER',
  };
  return (
    <span className="text-[9px] font-semibold tracking-widest text-muted-foreground/60 uppercase"></span>
  );
}

function ScheduledBadge({ scheduledAt }: { scheduledAt: string | null | undefined }) {
  if (!scheduledAt) return null;
  const d = new Date(scheduledAt);
  const fmt = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70 shrink-0">
      <Clock className="h-3 w-3" />
      {fmt}
    </span>
  );
}

export function BlockItem({ block, onUpdate, onDelete }: BlockItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(block.content);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const startEditing = () => {
    setEditValue(block.content);
    setIsEditing(true);
  };

  const commitEdit = () => {
    if (editValue.trim() !== block.content) {
      onUpdate({ id: block.id, columnId: block.columnId, content: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && block.type !== 'PARAGRAPH') {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === 'Escape') {
      setEditValue(block.content);
      setIsEditing(false);
    }
  };

  // ─── DIVIDER ─────────────────────────────────────────────────────────────
  if (block.type === 'DIVIDER') {
    return (
      <div ref={setNodeRef} style={style} className="group flex items-center gap-2 py-1">
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground/50 shrink-0"
        >
          <GripVertical className="h-3 w-3" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <BlockLabel type="DIVIDER" />
          <hr className="flex-1 border-border/40" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(block.id)}
          className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // ─── HEADING ─────────────────────────────────────────────────────────────
  if (block.type === 'HEADING') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group flex items-start gap-2 rounded-lg hover:bg-muted/20 p-1.5 -mx-1.5 transition-colors"
      >
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground/50 mt-2 shrink-0"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <BlockLabel type="HEADING" />
          {isEditing ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-xl font-bold text-foreground outline-none border-b border-primary/50 pb-0.5"
            />
          ) : (
            <p
              className="text-xl font-bold text-foreground cursor-text leading-snug"
              onClick={startEditing}
            >
              {block.content || (
                <span className="text-muted-foreground/40 italic text-base font-normal">
                  Untitled heading...
                </span>
              )}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(block.id)}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 shrink-0 mt-1"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // ─── PARAGRAPH ───────────────────────────────────────────────────────────
  if (block.type === 'PARAGRAPH') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group flex items-start gap-2 rounded-lg hover:bg-muted/20 p-1.5 -mx-1.5 transition-colors"
      >
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground/50 mt-1 shrink-0"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <BlockLabel type="PARAGRAPH" />
          {isEditing ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full bg-transparent text-sm text-foreground outline-none border-b border-primary/50 resize-none pb-0.5"
            />
          ) : (
            <p
              className="text-sm text-muted-foreground leading-relaxed cursor-text whitespace-pre-wrap"
              onClick={startEditing}
            >
              {block.content || (
                <span className="text-muted-foreground/40 italic">Add text...</span>
              )}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(block.id)}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 shrink-0 mt-0.5"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // ─── TODO ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-2 rounded-lg p-2 -mx-1.5 transition-all duration-200 border border-transparent',
        'hover:bg-muted/20 hover:border-border/30',
        block.isCompleted && 'opacity-60',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground/50 mt-0.5 shrink-0"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Checkbox
        checked={block.isCompleted}
        onCheckedChange={(checked) =>
          onUpdate({ id: block.id, columnId: block.columnId, isCompleted: !!checked })
        }
        className="mt-0.5 h-4 w-4 shrink-0 rounded"
      />
      <div className="flex-1 min-w-0">
        <BlockLabel type="TODO" />
        {isEditing ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-foreground outline-none border-b border-primary/50 pb-0.5"
          />
        ) : (
          <p
            className={cn(
              'text-sm text-foreground cursor-text',
              block.isCompleted && 'line-through text-muted-foreground',
            )}
            onClick={startEditing}
          >
            {block.content || <span className="text-muted-foreground/40 italic">Add task...</span>}
          </p>
        )}
        <ScheduledBadge scheduledAt={block.scheduledAt} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(block.id)}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 shrink-0"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
