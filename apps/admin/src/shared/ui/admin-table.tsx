import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, ListFilterIcon, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const PAGE_SIZE = 25;

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const TableSearch = ({ value, onChange, placeholder = "Пошук" }: SearchProps) => {
  const [draft, setDraft] = useState(value);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) setDraft(value);
  }, [value]);

  return (
    <div className="relative w-full md:max-w-sm">
      <Input
        placeholder={placeholder}
        value={draft}
        autoComplete="off"
        aria-label={placeholder}
        className="h-9 ps-9"
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          const trimmed = draft.trim();
          setDraft(trimmed);
          if (trimmed !== value) onChange(trimmed);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          onChange(next.trim());
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground/80">
        <ListFilterIcon size={16} />
      </div>
    </div>
  );
};

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export const TablePagination = ({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) => {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {from}–{to} з {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Попередня сторінка"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="min-w-16 text-center text-sm tabular-nums">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Наступна сторінка"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};

type FrameProps = {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  toolbar?: ReactNode;
  children: ReactNode;
};

export const TableFrame = ({
  search,
  onSearch,
  searchPlaceholder,
  page,
  totalPages,
  total,
  onPageChange,
  isLoading,
  toolbar,
  children,
}: FrameProps) => (
  <div className="flex min-h-0 flex-1 flex-col gap-4">
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <TableSearch value={search} onChange={onSearch} placeholder={searchPlaceholder} />
      {toolbar}
    </div>
    <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-md border bg-card">
      <div className={cn("min-h-0 overflow-auto", isLoading && "p-4")}>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          children
        )}
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={onPageChange}
      />
    </div>
  </div>
);

export const NameCell = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => (
  <span className="flex items-center gap-2">
    <Icon className="size-4 shrink-0 text-muted-foreground" />
    <span className="min-w-0">{children}</span>
  </span>
);
