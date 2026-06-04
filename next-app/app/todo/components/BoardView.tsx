'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Column, useCreateColumn, useUpdateColumn, useDeleteColumn } from '@/hooks/useColumns';
import {
  Block,
  BlockType,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useMoveBlock,
} from '@/hooks/useBlocks';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { ColumnCard } from './ColumnCard';
import { BlockItem } from './BlockItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Minimize2 } from 'lucide-react';

interface BoardViewProps {
  spaceId: number;
  columns: Column[];
  /** Map of columnId → blocks */
  blocksByColumn: Record<number, Block[]>;
}

export function BoardView({ spaceId, columns, blocksByColumn }: BoardViewProps) {
  const { activeFilter, dateRange, focusedColumnId, setFocusedColumn } = useWorkspaceStore();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);

  const queryClient = useQueryClient();
  const createColumn = useCreateColumn();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();
  const createBlock = useCreateBlock();
  const updateBlock = useUpdateBlock();
  const deleteBlock = useDeleteBlock();
  const moveBlock = useMoveBlock();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // ─── DnD handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find block by id
    for (const col of columns) {
      const found = (blocksByColumn[col.id] || []).find((b) => b.id === active.id);
      if (found) {
        setActiveBlock(found);
        break;
      }
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optimistic reorder handled in dragEnd
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (!over || active.id === over.id) return;

    // Detect if dragging over a column drop target
    const overIdStr = String(over.id);
    const isOverColumn = overIdStr.startsWith('col-');
    const targetColumnId = isOverColumn ? Number(overIdStr.replace('col-', '')) : null;

    // Find source block and column
    let sourceBlock: Block | null = null;
    let sourceColumnId: number | null = null;

    for (const col of columns) {
      const found = (blocksByColumn[col.id] || []).find((b) => b.id === active.id);
      if (found) {
        sourceBlock = found;
        sourceColumnId = col.id;
        break;
      }
    }

    if (!sourceBlock || sourceColumnId === null) return;

    // Case 1: dropped onto another column header → move cross-column
    if (targetColumnId && targetColumnId !== sourceColumnId) {
      const targetBlocks = blocksByColumn[targetColumnId] || [];
      const newOrder = targetBlocks.length;
      moveBlock.mutate(
        { id: sourceBlock.id, sourceColumnId, targetColumnId, order: newOrder },
        { onError: () => toast.error('Failed to move block') },
      );
      return;
    }

    // Case 2: dropped onto another block (same or different column)
    let destColumnId = sourceColumnId;
    let destBlock: Block | null = null;
    for (const col of columns) {
      const found = (blocksByColumn[col.id] || []).find((b) => b.id === over.id);
      if (found) {
        destBlock = found;
        destColumnId = col.id;
        break;
      }
    }

    if (!destBlock) return;

    // Cross-column move
    if (destColumnId !== sourceColumnId) {
      moveBlock.mutate(
        {
          id: sourceBlock.id,
          sourceColumnId,
          targetColumnId: destColumnId,
          order: destBlock.order,
        },
        { onError: () => toast.error('Failed to move block') },
      );
      return;
    }

    // Same-column reorder — optimistic update then persist
    const colBlocks = [...(blocksByColumn[sourceColumnId] || [])];
    const oldIndex = colBlocks.findIndex((b) => b.id === active.id);
    const newIndex = colBlocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(colBlocks, oldIndex, newIndex).map((b, i) => ({
      ...b,
      order: i,
    }));

    // Optimistic cache update
    queryClient.setQueryData(['blocks', sourceColumnId, activeFilter, dateRange], reordered);

    // Persist to backend via api (carries JWT cookie)
    api
      .patch(`/columns/${sourceColumnId}/blocks/reorder`, {
        blocks: reordered.map((b) => ({ id: b.id, order: b.order })),
      })
      .catch(() => {
        queryClient.invalidateQueries({ queryKey: ['blocks', sourceColumnId] });
        toast.error('Failed to reorder blocks');
      });
  };

  // ─── Column actions ────────────────────────────────────────────────────────
  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    createColumn.mutate(
      { spaceId, title: newColumnTitle.trim() },
      {
        onSuccess: () => {
          setNewColumnTitle('');
          setIsAddingColumn(false);
          toast.success('Column added');
        },
        onError: () => toast.error('Failed to create column'),
      },
    );
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const columnIds = sortedColumns.map((c) => c.id);

  // ── ESC key exits focus mode ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedColumnId) setFocusedColumn(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusedColumnId, setFocusedColumn]);

  // ── Fullscreen focus overlay ───────────────────────────────────────────────
  const focusedColumn = focusedColumnId
    ? sortedColumns.find((c) => c.id === focusedColumnId)
    : null;

  const focusOverlay = focusedColumn
    ? (() => {
        const colBlocks = (blocksByColumn[focusedColumn.id] || []).sort(
          (a, b) => a.order - b.order,
        );
        return (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md"
            style={{ paddingLeft: 'var(--sidebar-width, 0px)' }}
          >
            {/* Focus header bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
                  Focus Mode
                </span>
                <span className="text-muted-foreground/40">·</span>
                <h2 className="text-lg font-bold text-foreground">{focusedColumn.title}</h2>
                <span className="text-xs text-muted-foreground/50 tabular-nums bg-muted/40 px-2 py-0.5 rounded-full">
                  {colBlocks.length} block{colBlocks.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setFocusedColumn(null)}
              >
                <Minimize2 className="h-4 w-4" />
                Exit focus
                <kbd className="text-[10px] bg-muted/60 border border-border/40 rounded px-1.5 py-0.5 font-mono">
                  ESC
                </kbd>
              </Button>
            </div>

            {/* Full-width column content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl mx-auto space-y-1">
                {colBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/40">
                    <p className="text-sm italic">No blocks yet in this column.</p>
                    <p className="text-xs mt-1">
                      Use the &quot;Add Block +&quot; button to get started.
                    </p>
                  </div>
                ) : (
                  colBlocks.map((block) => (
                    <BlockItem
                      key={block.id}
                      block={block}
                      onUpdate={(updates) => updateBlock.mutate(updates)}
                      onDelete={(id) =>
                        deleteBlock.mutate(
                          { columnId: focusedColumn.id, id },
                          { onSuccess: () => toast.success('Block deleted') },
                        )
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* Add block footer */}
            <div className="border-t border-border/30 px-6 py-3 bg-card/40 backdrop-blur-sm">
              <div className="max-w-2xl mx-auto flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground/60 mr-1">Add block:</span>
                {(['HEADING', 'PARAGRAPH', 'TODO', 'DIVIDER'] as BlockType[]).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 border-border/40 hover:border-primary/40 hover:text-primary"
                    onClick={() =>
                      createBlock.mutate(
                        { columnId: focusedColumn.id, type },
                        { onSuccess: () => toast.success('Block added') },
                      )
                    }
                  >
                    <Plus className="h-3 w-3" />
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      })()
    : null;

  const mobileView = (
    <div className="flex flex-col gap-4 px-4 md:hidden pb-6">
      {sortedColumns.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 text-sm">
          No columns yet. Add your first column above.
        </div>
      ) : (
        sortedColumns.map((col) => {
          const colBlocks = (blocksByColumn[col.id] || []).sort((a, b) => a.order - b.order);
          return (
            <div
              key={col.id}
              className="flex flex-col gap-1 bg-card/60 rounded-xl border border-border/30 p-3"
            >
              <div className="font-semibold text-sm mb-2 px-1 text-foreground">{col.title}</div>
              {colBlocks.map((block) => (
                <BlockItem
                  key={block.id}
                  block={block}
                  onUpdate={(updates) => updateBlock.mutate(updates)}
                  onDelete={(id) =>
                    deleteBlock.mutate(
                      { columnId: col.id, id },
                      { onSuccess: () => toast.success('Block deleted') },
                    )
                  }
                />
              ))}
              {colBlocks.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-4 italic">
                  No blocks yet
                </p>
              )}
              <div className="pt-2 mt-2 border-t border-border/20 grid grid-cols-2 gap-1.5">
                {(['HEADING', 'PARAGRAPH', 'TODO', 'DIVIDER'] as BlockType[]).map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40 justify-start px-2"
                    onClick={() =>
                      createBlock.mutate(
                        { columnId: col.id, type },
                        { onSuccess: () => toast.success('Block added') },
                      )
                    }
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const desktopView = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="hidden md:flex flex-wrap items-start gap-4 px-4 pb-6 min-h-[calc(100vh-200px)] content-start">
        <SortableContext items={columnIds} strategy={rectSortingStrategy}>
          {sortedColumns.map((col) => {
            const colBlocks = (blocksByColumn[col.id] || []).sort((a, b) => a.order - b.order);
            return (
              <ColumnCard
                key={col.id}
                column={col}
                blocks={colBlocks}
                onUpdateColumn={(updates) => updateColumn.mutate(updates)}
                onDeleteColumn={(id) =>
                  deleteColumn.mutate(
                    { spaceId, id },
                    { onSuccess: () => toast.success('Column deleted') },
                  )
                }
                onCreateBlock={(type) =>
                  createBlock.mutate(
                    { columnId: col.id, type },
                    { onSuccess: () => toast.success('Block added') },
                  )
                }
                onUpdateBlock={(updates) => updateBlock.mutate(updates)}
                onDeleteBlock={(id) =>
                  deleteBlock.mutate(
                    { columnId: col.id, id },
                    { onSuccess: () => toast.success('Block deleted') },
                  )
                }
                isFocused={focusedColumnId === col.id}
                onFocus={() => setFocusedColumn(col.id)}
                onUnfocus={() => setFocusedColumn(null)}
              />
            );
          })}
        </SortableContext>

        {/* Add Column Button */}
        <div className="flex-shrink-0">
          {isAddingColumn ? (
            <form
              onSubmit={handleCreateColumn}
              className="flex items-center gap-2 bg-card/60 border border-border/30 rounded-xl px-3 py-2 w-[220px]"
            >
              <Input
                autoFocus
                placeholder="Column title..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="h-7 text-sm bg-transparent border-0 p-0 focus-visible:ring-0 flex-1"
              />
              <Button type="submit" size="icon" className="h-6 w-6 shrink-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </form>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/30"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              add-column
            </Button>
          )}
        </div>
      </div>

      {/* Drag overlay — shows floating copy of dragged block */}
      <DragOverlay>
        {activeBlock && (
          <div className="bg-card border border-primary/40 rounded-lg shadow-xl shadow-black/30 px-3 py-2 opacity-95 rotate-1 cursor-grabbing w-64">
            <p className="text-sm text-foreground truncate">{activeBlock.content || '—'}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );

  return (
    <>
      {/* Full-screen focus overlay — rendered on top of everything */}
      {focusOverlay}

      {/* Normal board (always rendered underneath so state is preserved) */}
      {mobileView}
      {desktopView}
    </>
  );
}
