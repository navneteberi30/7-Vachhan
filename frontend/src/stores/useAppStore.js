import { create } from 'zustand'

/**
 * Global app store using Zustand.
 * Add slices here as the app grows (auth, UI state, etc.).
 */
export const useAppStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
}))
