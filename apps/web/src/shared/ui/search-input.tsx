import { Button } from "@autolab/ui/components/button";
import { cn } from "@autolab/ui/lib/utils";
import { Search } from "lucide-react";

type Props = {
  placeholder?: string;
  className?: string;
  onClick?: () => void;
};

export const SearchInput = ({ placeholder = "Пошук", className, onClick }: Props) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    className={cn(
      "relative w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50 sm:pr-12 md:w-40 md:flex-none lg:w-56 xl:w-64",
      className,
    )}
  >
    <Search aria-hidden="true" className="absolute top-1/2 left-1.5 -translate-y-1/2" />
    <span className="ml-3">{placeholder}</span>
    <kbd className="pointer-events-none absolute top-[0.4rem] right-[0.4rem] hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
      <span className="text-xs">⌘</span>K
    </kbd>
  </Button>
);
