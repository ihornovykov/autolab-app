import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Checkbox } from "@autolab/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@autolab/ui/components/popover";
import { Separator } from "@autolab/ui/components/separator";
import { cn } from "@autolab/ui/lib/utils";
import { Plus } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  title: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
};

export const DataTableFilterBox = ({
  title,
  options,
  value,
  onChange,
  className,
}: Props) => {
  const selected = new Set(value);

  const toggleValue = (nextValue: string) => {
    const updated = new Set(selected);
    if (updated.has(nextValue)) updated.delete(nextValue);
    else updated.add(nextValue);
    onChange(Array.from(updated));
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className={cn("h-9 border-dashed", className)} />
        }
      >
        <Plus className="size-4" />
        {title}
        {selected.size > 0 ? (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
              {selected.size}
            </Badge>
            <div className="hidden gap-1 lg:flex">
              {selected.size > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {selected.size} обрано
                </Badge>
              ) : (
                Array.from(selected).map((item) => (
                  <Badge key={item} variant="secondary" className="rounded-sm px-1 font-normal">
                    {options.find((option) => option.value === item)?.label ?? item}
                  </Badge>
                ))
              )}
            </div>
          </>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2">
        <div className="space-y-1">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={selected.has(option.value)}
                onCheckedChange={() => toggleValue(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {selected.size > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => onChange([])}
          >
            Очистити
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
