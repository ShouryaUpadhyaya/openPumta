import { create } from 'zustand';

export type FilterType = 'all' | 'today' | 'last1w' | 'overdue' | 'dateRange';

interface DateRange {
  from: string;
  to: string;
}

interface WorkspaceState {
  activeSpaceId: number | null;
  activeFilter: FilterType;
  dateRange: DateRange | undefined;
  focusedColumnId: number | null;
  // Actions
  setActiveSpace: (id: number | null) => void;
  setFilter: (filter: FilterType, dateRange?: DateRange) => void;
  setFocusedColumn: (id: number | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeSpaceId: null,
  activeFilter: 'all',
  dateRange: undefined,
  focusedColumnId: null,

  setActiveSpace: (id) => set({ activeSpaceId: id }),
  setFilter: (filter, dateRange) => set({ activeFilter: filter, dateRange }),
  setFocusedColumn: (id) => set({ focusedColumnId: id }),
}));
