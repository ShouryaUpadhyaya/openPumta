'use client';

import React, { useState, useRef } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column } from '@/hooks/useColumns';
import { Block, BlockType } from '@/hooks/useBlocks';
import { BlockItem } from './BlockItem';
import { Button } from '@/components/ui/button';
import { Minus, Pencil, Maximize2, Plus, X, GripVertical, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const BLOCK_TYPES: { type: BlockType; label: string; description: string }[] = [
  { type: 'HEADING', label: 'Heading', description: 'Large section title' },
  { type: 'PARAGRAPH', label: 'Paragraph', description: 'Plain text note' },
  { type: 'TODO', label: 'Todo', description: 'Checkbox task' },
  { type: 'DIVIDER', label: 'Divider', description: 'Horizontal rule' },
];

interface ColumnCardProps {
  column: Column;
  blocks: Block[];
  onUpdateColumn: (updates: Partial<Column> & { id: number; spaceId: number }) => void;
  onDeleteColumn: (id: number) => void;
  onCreateBlock: (type: BlockType) => void;
  onUpdateBlock: (updates: Partial<Block> & { id: number; columnId: number }) => void;
  onDeleteBlock: (id: number) => void;
  isFocused?: boolean;
  onFocus: () => void;
  onUnfocus: () => void;
}

/** Drag handle for the column itself (used in BoardView) */
export function ColumnDragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <button
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

export function ColumnCard({
  column,
  blocks,
  onUpdateColumn,
  onDeleteColumn,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  isFocused,
  onFocus,
  onUnfocus,
}: ColumnCardProps) {
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Make column a droppable target for cross-column DnD
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `col-${column.id}` });

  const blockIds = blocks.map((b) => b.id);

  const commitTitle = () => {
    if (titleValue.trim() && titleValue.trim() !== column.title) {
      onUpdateColumn({ id: column.id, spaceId: column.spaceId, title: titleValue.trim() });
    } else {
      setTitleValue(column.title);
    }
    setIsTitleEditing(false);
  };

  const toggleCollapse = () => {
    onUpdateColumn({ id: column.id, spaceId: column.spaceId, isCollapsed: !column.isCollapsed });
  };

  const handleDeleteColumn = () => {
    onDeleteColumn(column.id);
    toast.success('Column deleted');
  };

  // ─── Collapsed state ──────────────────────────────────────────────────────
  if (column.isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 w-10 py-3 rounded-xl bg-card/60 border border-border/30 flex-shrink-0">
        <button
          onClick={toggleCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={column.title}
        >
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
        </button>
        <span
          className="text-[10px] font-semibold text-muted-foreground writing-mode-vertical"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {column.title}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setDropRef}
      style={{ width: column.width ? `${column.width}px` : '280px' }}
      className={cn(
        'flex flex-col rounded-xl bg-card/60 border border-border/30 flex-shrink-0 transition-all duration-200',
        isOver && 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10',
        isFocused && 'ring-2 ring-primary/40',
      )}
    >
      {/* ── Column Header ── */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border/20">
        {/* Title */}
        <div className="flex-1 min-w-0">
          {isTitleEditing ? (
            <input
              ref={titleInputRef}
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') {
                  setTitleValue(column.title);
                  setIsTitleEditing(false);
                }
              }}
              className="w-full bg-transparent text-sm font-semibold text-foreground outline-none border-b border-primary/50"
            />
          ) : (
            <h3
              className="text-sm font-semibold text-foreground truncate cursor-text hover:text-primary transition-colors"
              onClick={() => setIsTitleEditing(true)}
              title={column.title}
            >
              {column.title}
            </h3>
          )}
        </div>

        {/* Block count badge */}
        <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
          {blocks.length}
        </span>

        {/* Column actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={toggleCollapse}
            title="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsTitleEditing(true)}
            title="Edit title"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {isFocused ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary hover:text-foreground"
              onClick={onUnfocus}
              title="Exit focus"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onFocus}
              title="Focus mode"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                title="Delete column"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteColumn}
              >
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Blocks List ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 min-h-[80px] max-h-[calc(100vh-260px)]">
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/40 italic">
              No blocks yet
            </div>
          ) : (
            blocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                onUpdate={onUpdateBlock}
                onDelete={onDeleteBlock}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* ── Add Block Button ── */}
      <div className="px-3 pb-3 pt-2 border-t border-border/20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 justify-start"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {BLOCK_TYPES.map(({ type, label, description }) => (
              <DropdownMenuItem
                key={type}
                onClick={() => onCreateBlock(type)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
