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
  focusedTextBoxId: number | null;
  draggingTextBox: { id: number; spaceId: number } | null;
  // Actions
  setActiveSpace: (id: number | null) => void;
  setFilter: (filter: FilterType, dateRange?: DateRange) => void;
  setFocusedTextBox: (id: number | null) => void;
  setDraggingTextBox: (data: { id: number; spaceId: number } | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeSpaceId: null,
  activeFilter: 'all',
  dateRange: undefined,
  focusedTextBoxId: null,
  draggingTextBox: null,

  setActiveSpace: (id) => set({ activeSpaceId: id }),
  setFilter: (filter, dateRange) => set({ activeFilter: filter, dateRange }),
  setFocusedTextBox: (id) => set({ focusedTextBoxId: id }),
  setDraggingTextBox: (data) => set({ draggingTextBox: data }),
}));
