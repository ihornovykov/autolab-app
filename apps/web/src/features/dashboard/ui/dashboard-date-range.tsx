import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_DATE_PRESETS } from "@/features/dashboard/lib/constants";
import type { DashboardDatePreset } from "@/features/dashboard/lib/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Calendar } from "@autolab/ui/components/calendar";
import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";
import { Button } from "@autolab/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@autolab/ui/components/popover";
import { cn } from "@autolab/ui/lib/utils";
import { Card } from "@autolab/ui/components/card";

type Props = {
  preset: DashboardDatePreset;
  value: DateRangeFilterValue | null;
  onPresetChange: (preset: DashboardDatePreset) => void;
  onValueChange: (value: DateRangeFilterValue | null) => void;
  className?: string;
};

const parseDay = (value?: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toDayString = (date: Date) => format(date, "yyyy-MM-dd");

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

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

export const DashboardDateRange = ({
  preset,
  value,
  onPresetChange,
  onValueChange,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const selected = useMemo(() => {
    if (!value?.from) return undefined;

    const from = parseDay(value.from);
    const to = parseDay(value.to ?? value.from);
    if (!from || !to) return undefined;

    return { from, to };
  }, [value]);

  const [month, setMonth] = useState(() => getMonthStart(selected?.from ?? new Date()));

  useEffect(() => {
    if (selected?.from) {
      setMonth(getMonthStart(selected.from));
    }
  }, [selected?.from]);

  const handleSelect = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from) {
      onValueChange(null);
      return;
    }

    onPresetChange("custom");
    onValueChange({
      from: toDayString(range.from),
      to: range.to ? toDayString(range.to) : undefined,
    });

    if (range.to) {
      setOpen(false);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange(null);
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center", className)}>
      <Card className="flex w-full flex-wrap gap-1 rounded-lg p-1 lg:w-auto">
        {DASHBOARD_DATE_PRESETS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={preset === item.id ? "default" : "ghost"}
            className={cn(
              "h-7 flex-1 px-2 font-medium lg:flex-none lg:px-3",
              preset === item.id && "shadow-sm font-semibold",
            )}
            onClick={() => {
              if (item.id === "custom") return;
              onPresetChange(item.id);
            }}
          >
            {item.label}
          </Button>
        ))}
      </Card>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal shadow-sm transition-colors lg:min-w-56 lg:w-auto",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            !value?.from && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left">
            {value?.from ? formatDisplayValue(value) : "Обрати період"}
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
                onValueChange(null);
              }}
            >
              <XIcon className="size-3.5" />
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[calc(100vw-2rem)] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="range"
            locale={uk}
            numberOfMonths={isMobile ? 1 : 2}
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
