import { Input } from "@autolab/ui/components/input";
import { cn } from "@autolab/ui/lib/utils";
import { ListFilter } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const DataTableSearch = ({
  value,
  onChange,
  placeholder = "Пошук",
  className,
}: Props) => (
  <div className={cn("relative w-full p-px md:max-w-sm", className)}>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full ps-9"
      aria-label={placeholder}
    />
    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
      <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
    </div>
  </div>
);
