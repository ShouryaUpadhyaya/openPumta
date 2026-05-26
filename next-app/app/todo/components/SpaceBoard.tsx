'use client';

import React from 'react';
import { useBlocks, Block, FilterType } from '@/hooks/useBlocks';
import { Column } from '@/hooks/useColumns';
import { BoardView } from './BoardView';

interface SpaceBoardProps {
  spaceId: number;
  columns: Column[];
  filter: FilterType;
  dateRange?: { from: string; to: string };
}

/** Fetches blocks for each column and passes a combined map to BoardView */
function ColumnBlockFetcher({
  column,
  filter,
  dateRange,
  onReady,
}: {
  column: Column;
  filter: FilterType;
  dateRange?: { from: string; to: string };
  onReady: (columnId: number, blocks: Block[]) => void;
}) {
  const { data } = useBlocks(column.id, filter, dateRange);
  React.useEffect(() => {
    onReady(column.id, data ?? []);
  }, [column.id, data, onReady]);
  return null;
}

export function SpaceBoard({ spaceId, columns, filter, dateRange }: SpaceBoardProps) {
  const [blocksByColumn, setBlocksByColumn] = React.useState<Record<number, Block[]>>({});

  const handleReady = React.useCallback((columnId: number, blocks: Block[]) => {
    setBlocksByColumn((prev) => ({ ...prev, [columnId]: blocks }));
  }, []);

  return (
    <>
      {/* Silent fetchers per column */}
      {columns.map((col) => (
        <ColumnBlockFetcher
          key={col.id}
          column={col}
          filter={filter}
          dateRange={dateRange}
          onReady={handleReady}
        />
      ))}
      <BoardView spaceId={spaceId} columns={columns} blocksByColumn={blocksByColumn} />
    </>
  );
}
