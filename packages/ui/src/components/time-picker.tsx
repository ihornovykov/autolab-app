"use client";

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
import { ClockIcon } from "lucide-react";
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

const padTime = (value: number) => value.toString().padStart(2, "0");

const parseTime = (value?: string) => {
  if (!value) return { hour: null, minute: null };

  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return { hour: null, minute: null };

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
};

const formatTimeValue = (hour: number, minute: number) => `${padTime(hour)}:${padTime(minute)}`;

export const TimePicker = ({
  label,
  placeholder = "Оберіть час",
  value,
  onChange,
  error,
  disabled,
  minuteStep = 15,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const parsed = parseTime(value);

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

  const selectedHour = parsed.hour === null ? null : String(parsed.hour);
  const selectedMinute = parsed.minute === null ? null : String(parsed.minute);

  const handleHourChange = (hourValue: string | null) => {
    if (!hourValue) return;
    const minute = parsed.minute ?? 0;
    onChange(formatTimeValue(Number(hourValue), minute));
  };

  const handleMinuteChange = (minuteValue: string | null) => {
    if (!minuteValue) return;
    const hour = parsed.hour ?? 9;
    onChange(formatTimeValue(hour, Number(minuteValue)));
  };

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
          <ClockIcon className="mr-2 size-4 shrink-0" />
          {value ? <span>{value}</span> : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start" side="bottom" sideOffset={4}>
          <div className="flex items-center justify-center gap-2">
            <Select value={selectedHour} onValueChange={handleHourChange} items={hourItems}>
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
            <Select value={selectedMinute} onValueChange={handleMinuteChange} items={minuteItems}>
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
