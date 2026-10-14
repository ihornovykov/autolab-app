"use client";

import { cn } from "@autolab/ui/lib/utils";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";

const Select = SelectPrimitive.Root;

const SelectGroup = ({ className, ...props }: SelectPrimitive.Group.Props) => (
  <SelectPrimitive.Group data-slot="select-group" className={cn(className)} {...props} />
);

const SelectValue = ({ className, ...props }: SelectPrimitive.Value.Props) => (
  <SelectPrimitive.Value
    data-slot="select-value"
    className={cn("flex flex-1 text-left", className)}
    {...props}
  />
);

const SelectTrigger = ({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    className={cn(
      "flex h-9 w-full cursor-pointer items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none",
      "ring-offset-background placeholder:text-muted-foreground data-placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-1 focus:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon
      render={<ChevronDownIcon className="h-4 w-4 opacity-50" />}
    />
  </SelectPrimitive.Trigger>
);

const SelectScrollUpButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) => (
  <SelectPrimitive.ScrollUpArrow
    data-slot="select-scroll-up-button"
    className={cn("flex cursor-pointer items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUpIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollUpArrow>
);

const SelectScrollDownButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) => (
  <SelectPrimitive.ScrollDownArrow
    data-slot="select-scroll-down-button"
    className={cn("flex cursor-pointer items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDownIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollDownArrow>
);

const SelectContent = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      className="isolate z-[80]"
    >
      <SelectPrimitive.Popup
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-(--available-height) w-(--anchor-width) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md",
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.List className="p-1">{children}</SelectPrimitive.List>
        <SelectScrollDownButton />
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
);

const SelectLabel = ({ className, ...props }: SelectPrimitive.GroupLabel.Props) => (
  <SelectPrimitive.GroupLabel
    data-slot="select-label"
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
);

const SelectItem = ({ className, children, ...props }: SelectPrimitive.Item.Props) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
      "focus:bg-accent focus:text-accent-foreground",
      "data-disabled:pointer-events-none data-disabled:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

const SelectSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
);

const NativeSelect = ({ className, ...props }: React.ComponentProps<"select">) => (
  <select
    data-slot="native-select"
    className={cn(
      "flex h-9 w-full cursor-pointer items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none",
      "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

const Switch = ({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      checked ? "bg-primary" : "bg-input",
      className,
    )}
  >
    <span
      className={cn(
        "pointer-events-none block size-4 translate-y-0.5 rounded-full bg-background shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-0.5",
      )}
    />
  </button>
);

const ScrollArea = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("overflow-auto", className)} {...props} />
);

const Tooltip = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => (
  <span title={content} className="inline-flex">
    {children}
  </span>
);

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  NativeSelect,
  Switch,
  ScrollArea,
  Tooltip,
};
