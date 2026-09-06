import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceSettingsState {
  autoArrangeNewTextBoxes: boolean;
  setAutoArrangeNewTextBoxes: (val: boolean) => void;
}

export const useWorkspaceSettingsStore = create<WorkspaceSettingsState>()(
  persist(
    (set) => ({
      autoArrangeNewTextBoxes: true,
      setAutoArrangeNewTextBoxes: (val) => set({ autoArrangeNewTextBoxes: val }),
    }),
    {
      name: 'openpumta-workspace-settings',
    },
  ),
);
