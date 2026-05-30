import { create } from "zustand";

interface HomeState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useHomeStore = create<HomeState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
