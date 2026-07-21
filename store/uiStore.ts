import { create } from 'zustand';

interface UIState {
  navOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  navOpen: false,
  toggleNav: () => set((state) => ({ navOpen: !state.navOpen })),
  closeNav: () => set({ navOpen: false }),
}));
