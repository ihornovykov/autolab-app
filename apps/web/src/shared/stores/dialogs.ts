import type { ReactNode } from "react";
import { create } from "zustand";

type DialogsState = {
  content: ReactNode | null;
  open: (content: ReactNode) => void;
  close: () => void;
};

export const useDialogsStore = create<DialogsState>((set) => ({
  content: null,
  open: (content) => set({ content }),
  close: () => set({ content: null }),
}));

export const dialogs = {
  open: (content: ReactNode) => useDialogsStore.getState().open(content),
  close: () => useDialogsStore.getState().close(),
};
