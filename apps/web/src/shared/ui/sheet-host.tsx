import { useSheetsStore } from "@/shared/stores/sheets";

export const SheetHost = () => {
  const content = useSheetsStore((state) => state.content);
  if (!content) return null;
  return content;
};
