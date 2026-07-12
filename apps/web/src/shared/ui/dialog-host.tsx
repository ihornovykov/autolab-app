import { useDialogsStore } from "@/shared/stores/dialogs";

export const DialogHost = () => {
  const content = useDialogsStore((state) => state.content);
  if (!content) return null;
  return content;
};
