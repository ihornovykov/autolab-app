import type { ReactNode } from "react";
import { create } from "zustand";

type SheetsState = {
  content: ReactNode | null;
  open: (content: ReactNode) => void;
  close: () => void;
};

export const useSheetsStore = create<SheetsState>((set) => ({
  content: null,
  open: (content) => set({ content }),
  close: () => set({ content: null }),
}));

export const sheets = {
  open: (content: ReactNode) => useSheetsStore.getState().open(content),
  close: () => useSheetsStore.getState().close(),
};
