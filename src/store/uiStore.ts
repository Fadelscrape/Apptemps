// UI Store - Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'auto';

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  taskModalOpen: boolean;
  setTaskModalOpen: (open: boolean) => void;

  projectModalOpen: boolean;
  setProjectModalOpen: (open: boolean) => void;

  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;

  // Editing
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'auto',
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // Modals
      taskModalOpen: false,
      setTaskModalOpen: (taskModalOpen) => set({ taskModalOpen }),

      projectModalOpen: false,
      setProjectModalOpen: (projectModalOpen) => set({ projectModalOpen }),

      settingsModalOpen: false,
      setSettingsModalOpen: (settingsModalOpen) => set({ settingsModalOpen }),

      // Editing
      editingTaskId: null,
      setEditingTaskId: (editingTaskId) => set({ editingTaskId }),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
