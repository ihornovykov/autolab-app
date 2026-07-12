"use client";

import { buttonVariants } from "@autolab/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
} from "@autolab/ui/components/select";
import { cn } from "@autolab/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, type DropdownProps } from "react-day-picker";

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export const Calendar = ({
  className,
  classNames,
  modifiersClassNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn("p-3", className)}
    classNames={{
      button_reset: "",
      button: "",
      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
      month: "space-y-4",
      vhidden: "vhidden hidden",
      caption: "flex justify-center pt-1 relative items-center",
      caption_label: "text-sm font-medium",
      caption_dropdowns: cn(
        "flex justify-between gap-1",
        props.captionLayout === "dropdown" && "w-full",
      ),
      nav: "space-x-1 flex items-center",
      nav_button: cn(
        buttonVariants({ variant: "outline" }),
        "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
      ),
      nav_button_previous: "absolute left-1",
      nav_button_next: "absolute right-1",
      table: "w-full border-collapse space-y-1",
      head_row: "flex",
      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] capitalize",
      row: "mt-2 flex w-full",
      cell: cn(
        "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        "[&:has([aria-selected].day-range-start)]:rounded-l-md",
        "[&:has([aria-selected].day-range-end)]:rounded-r-md",
        "[&:has([aria-selected].day-outside)]:bg-accent/50",
        "[&:has([aria-selected])]:bg-accent",
      ),
      day: cn(
        buttonVariants({ variant: "ghost" }),
        "size-9 p-0 font-normal aria-selected:opacity-100",
      ),
      day_selected:
        "rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      day_today:
        "day-today bg-accent font-semibold text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground",
      day_outside:
        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
      day_disabled: "text-muted-foreground opacity-50",
      day_range_middle:
        "day-range-middle !rounded-none !bg-accent !text-accent-foreground hover:!bg-accent hover:!text-accent-foreground focus:!bg-accent focus:!text-accent-foreground",
      day_range_start:
        "day-range-start !rounded-none !rounded-l-md !bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground focus:!bg-primary focus:!text-primary-foreground",
      day_range_end:
        "day-range-end !rounded-none !rounded-r-md !bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground focus:!bg-primary focus:!text-primary-foreground",
      day_hidden: "invisible",
      ...classNames,
    }}
    modifiersClassNames={{
      today: "day-today",
      outside: "day-outside",
      ...modifiersClassNames,
    }}
    components={{
      Dropdown: ({ value, onChange, children }: DropdownProps) => {
        const options = React.Children.toArray(children) as React.ReactElement<
          React.HTMLProps<HTMLOptionElement>
        >[];
        const selected = options.find((child) => child.props.value === value);

        const handleChange = (nextValue: string | null) => {
          if (!nextValue) return;
          const changeEvent = {
            target: { value: nextValue },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange?.(changeEvent);
        };

        return (
          <Select value={value?.toString()} onValueChange={handleChange}>
            <SelectTrigger className="pr-1.5 focus:ring-0">
              <SelectValue>{capitalize(String(selected?.props?.children ?? ""))}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-80">
              <ScrollArea className="h-80">
                {options.map((option, id) => (
                  <SelectItem
                    key={`${option.props.value}-${id}`}
                    value={option.props.value?.toString() ?? ""}
                  >
                    {capitalize(String(option.props.children ?? ""))}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        );
      },
      IconLeft: () => <ChevronLeft className="size-4" />,
      IconRight: () => <ChevronRight className="size-4" />,
    }}
    {...props}
  />
);
