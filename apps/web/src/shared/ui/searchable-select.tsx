import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import { Label } from "@autolab/ui/components/label";
import { cn } from "@autolab/ui/lib/utils";

export type SearchableSelectOption = { value: string; label: string };

type SearchableSelectProps = {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  emptyText?: string;
  error?: string;
  className?: string;
};

export const SearchableSelect = ({
  label,
  placeholder = "Оберіть значення",
  searchPlaceholder = "Пошук...",
  options,
  value,
  onValueChange,
  disabled,
  isLoading,
  emptyText = "Нічого не знайдено",
  error,
  className,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-1", className)}>
      {label ? <Label>{label}</Label> : null}
      <button
        type="button"
        disabled={disabled || isLoading}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
          {isLoading ? "Завантаження..." : (selectedLabel ?? placeholder)}
        </span>
        {isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        )}
      </button>
      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
          <div className="border-b border-input p-2">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <ul className="max-h-60 overflow-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      option.value === value && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
            )}
          </ul>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
