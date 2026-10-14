import { useState } from "react";

export const useTableState = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return { search, page, setPage, onSearch };
};
