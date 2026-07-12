"use client";

import { Badge } from "@autolab/ui/components/badge";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@autolab/ui/components/popover";
import { cn } from "@autolab/ui/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  error?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
};

export const MultiSelect = ({
  label,
  placeholder = "Оберіть опції",
  value,
  onChange,
  options,
  error,
  disabled,
  searchPlaceholder = "Пошук...",
  emptyMessage = "Нічого не знайдено",
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query),
    );
  }, [options, search]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet],
  );

  const toggleOption = (optionValue: string) => {
    const next = new Set(selectedSet);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onChange(Array.from(next));
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter((item) => item !== optionValue));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label ? <Label>{label}</Label> : null}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "inline-flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !value.length && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge key={option.value} variant="secondary" className="font-normal">
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 cursor-pointer rounded-full hover:bg-secondary-foreground/10"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeOption(option.value);
                    }}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--anchor-width)] min-w-64 p-0" align="start">
          <div className="border-b border-border/60 p-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedSet.has(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => toggleOption(option.value)}
                  >
                    <CheckIcon
                      className={cn("mt-0.5 size-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{option.label}</p>
                      {option.description ? (
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
