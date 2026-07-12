import { useEffect } from "react";

import { useGlobalSearchStore } from "@/features/search/model/global-search-store";

export const useGlobalSearchShortcut = () => {
  const setOpen = useGlobalSearchStore((state) => state.setOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);
};
