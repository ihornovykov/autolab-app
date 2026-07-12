"use client";

import { Calendar } from "@autolab/ui/components/calendar";
import { Label } from "@autolab/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@autolab/ui/components/popover";
import { cn } from "@autolab/ui/lib/utils";
import { uk } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
};

const formatDisplayDate = (value: string) => format(parseISO(value), "PP", { locale: uk });

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const DatePicker = ({
  label,
  placeholder = "Оберіть дату",
  value,
  onChange,
  error,
  disabled,
  fromYear = 1960,
  toYear = new Date().getFullYear(),
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDate(value);

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
          {value ? formatDisplayDate(value) : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={uk}
            captionLayout="dropdown"
            selected={selectedDate}
            defaultMonth={selectedDate ?? new Date(2000, 0, 1)}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            fromYear={fromYear}
            toYear={toYear}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
