import { Button } from "@autolab/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@autolab/ui/components/dropdown-menu";
import { cn } from "@autolab/ui/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

type Props = {
  className?: string;
};

export const ThemeSwitcher = ({ className }: Props) => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" className={cn("relative min-w-9", className)}>
            <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Обрати тему</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-40 rounded-md">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
          <span>Світла</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
          <span>Темна</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
          <span>Системна</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
