"use client";

import { Calendar } from "@autolab/ui/components/calendar";
import { Label } from "@autolab/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@autolab/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { cn } from "@autolab/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  minuteStep?: number;
  className?: string;
};

const toLocalValue = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const parseValue = (value?: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDisplayValue = (value: string) => format(parseISO(value), "PPP p", { locale: uk });

const padTime = (value: number) => value.toString().padStart(2, "0");

export const DateTimePicker = ({
  label,
  placeholder = "Оберіть дату та час",
  value,
  onChange,
  error,
  disabled,
  minuteStep = 15,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selectedDate = parseValue(value);

  const hourItems = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        value: String(hour),
        label: padTime(hour),
      })),
    [],
  );

  const minuteItems = useMemo(
    () =>
      Array.from({ length: 60 / minuteStep }, (_, index) => {
        const minute = index * minuteStep;
        return { value: String(minute), label: padTime(minute) };
      }),
    [minuteStep],
  );

  const updateDate = (nextDate: Date) => {
    onChange(toLocalValue(nextDate));
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    const nextDate = selectedDate ? new Date(selectedDate) : new Date();
    nextDate.setFullYear(date.getFullYear());
    nextDate.setMonth(date.getMonth());
    nextDate.setDate(date.getDate());
    if (!selectedDate) {
      const now = new Date();
      nextDate.setHours(now.getHours() + 1, 0, 0, 0);
    }
    updateDate(nextDate);
  };

  const handleHourChange = (hourValue: string | null) => {
    if (!hourValue) return;
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setHours(Number(hourValue), selectedDate?.getMinutes() ?? 0, 0, 0);
    updateDate(base);
  };

  const handleMinuteChange = (minuteValue: string | null) => {
    if (!minuteValue) return;
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setMinutes(Number(minuteValue));
    if (!selectedDate) base.setHours(new Date().getHours() + 1, 0, 0, 0);
    updateDate(base);
  };

  const selectedHour = selectedDate ? String(selectedDate.getHours()) : null;
  const selectedMinute = selectedDate ? String(selectedDate.getMinutes()) : null;

  return (
    <div className={cn("space-y-1", className)}>
      {label ? <Label>{label}</Label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "inline-flex h-9 w-full cursor-pointer items-center justify-start rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal shadow-sm transition-colors",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {value ? formatDisplayValue(value) : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={4}>
          <Calendar
            mode="single"
            locale={uk}
            selected={selectedDate}
            defaultMonth={selectedDate ?? new Date()}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex items-center justify-center gap-2 border-t border-border/60 px-3 py-3">
            <Select
              value={selectedHour}
              onValueChange={handleHourChange}
              items={hourItems}
              disabled={!selectedDate}
            >
              <SelectTrigger className="w-[4.5rem]">
                <SelectValue placeholder="Год" />
              </SelectTrigger>
              <SelectContent>
                {hourItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm font-medium text-muted-foreground">:</span>
            <Select
              value={selectedMinute}
              onValueChange={handleMinuteChange}
              items={minuteItems}
              disabled={!selectedDate}
            >
              <SelectTrigger className="w-[4.5rem]">
                <SelectValue placeholder="Хв" />
              </SelectTrigger>
              <SelectContent>
                {minuteItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
