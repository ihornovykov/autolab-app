"use client";

import { Calendar } from "@autolab/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@autolab/ui/components/popover";
import { cn } from "@autolab/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

export type DateRangeFilterValue = {
  from: string;
  to?: string;
};

type Props = {
  value: DateRangeFilterValue | null;
  onChange: (value: DateRangeFilterValue | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const parseDay = (value?: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toDayString = (date: Date) => format(date, "yyyy-MM-dd");

const formatDisplayValue = (value: DateRangeFilterValue) => {
  const fromDate = parseDay(value.from);
  const toDate = parseDay(value.to ?? value.from);
  if (!fromDate || !toDate) return "";

  if (!value.to || value.from === value.to) {
    return format(fromDate, "d MMM yyyy", { locale: uk });
  }

  const sameYear = fromDate.getFullYear() === toDate.getFullYear();
  const sameMonth = sameYear && fromDate.getMonth() === toDate.getMonth();

  if (sameMonth) {
    return `${format(fromDate, "d", { locale: uk })} – ${format(toDate, "d MMM yyyy", { locale: uk })}`;
  }

  if (sameYear) {
    return `${format(fromDate, "d MMM", { locale: uk })} – ${format(toDate, "d MMM yyyy", { locale: uk })}`;
  }

  return `${format(fromDate, "d MMM yyyy", { locale: uk })} – ${format(toDate, "d MMM yyyy", { locale: uk })}`;
};

export const DateRangePicker = ({
  value,
  onChange,
  placeholder = "Дата або період",
  disabled,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);

  const selected = useMemo<DateRange | undefined>(() => {
    if (!value?.from) return undefined;

    return {
      from: parseDay(value.from),
      to: parseDay(value.to ?? value.from),
    };
  }, [value]);

  const handleSelect = (range?: DateRange) => {
    if (!range?.from) {
      onChange(null);
      return;
    }

    onChange({
      from: toDayString(range.from),
      to: range.to ? toDayString(range.to) : undefined,
    });

    if (range.to) setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "inline-flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal shadow-sm transition-colors",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value?.from && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">
          {value?.from ? formatDisplayValue(value) : placeholder}
        </span>
        {value?.from ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Очистити дату"
            className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              onChange(null);
            }}
          >
            <XIcon className="size-3.5" />
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={4}>
        <Calendar
          mode="range"
          locale={uk}
          numberOfMonths={1}
          selected={selected}
          defaultMonth={selected?.from ?? new Date()}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
