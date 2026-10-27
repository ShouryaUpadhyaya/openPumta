import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceSettingsState {
  /** Desktop/tablet: tile text boxes like a window manager instead of a free-form canvas */
  tilingLayout: boolean;
  setTilingLayout: (val: boolean) => void;
  /** Free-form canvas only */
  autoArrangeNewTextBoxes: boolean;
  setAutoArrangeNewTextBoxes: (val: boolean) => void;
}

export const useWorkspaceSettingsStore = create<WorkspaceSettingsState>()(
  persist(
    (set) => ({
      tilingLayout: true,
      setTilingLayout: (val) => set({ tilingLayout: val }),
      autoArrangeNewTextBoxes: true,
      setAutoArrangeNewTextBoxes: (val) => set({ autoArrangeNewTextBoxes: val }),
    }),
    {
      name: 'openpumta-workspace-settings',
    },
  ),
);
