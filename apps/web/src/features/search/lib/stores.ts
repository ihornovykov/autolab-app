import { create } from "zustand";

type GlobalSearchState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useGlobalSearchStore = create<GlobalSearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
