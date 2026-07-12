import { Button } from "@autolab/ui/components/button";
import { Separator } from "@autolab/ui/components/separator";
import { useRouterState } from "@tanstack/react-router";
import { ChevronRight, SearchIcon } from "lucide-react";

import { SearchInput } from "@/shared/ui/search-input";
import { useGlobalSearchStore } from "@/features/search/model/global-search-store";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";
import { UserAvatar } from "@/shared/ui/user-avatar";
import { UserDropdown } from "@/shared/ui/user-dropdown";

type Props = {
  user: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
};

const breadcrumbLabels: Record<string, string> = {
  organization: "Організація",
  employees: "Працівники",
  clients: "Клієнти",
  services: "Послуги",
  vehicles: "Авто",
  calendar: "Календар",
  account: "Акаунт",
  settings: "Налаштування",
};

export const DashboardTopbar = ({ user, onSignOut }: Props) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setSearchOpen = useGlobalSearchStore((state) => state.setOpen);
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = segments
    .filter((s) => breadcrumbLabels[s])
    .map((s, i, arr) => ({ label: breadcrumbLabels[s], isLast: i === arr.length - 1 }));

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 bg-background pr-4">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5 md:flex"
        >
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="size-3.5" /> : null}
              <span
                className={
                  crumb.isLast
                    ? "max-w-[90px] truncate text-md font-medium text-foreground md:max-w-full"
                    : "hidden md:block"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="sm:hidden"
          aria-label="Пошук"
          onClick={() => setSearchOpen(true)}
        >
          <SearchIcon className="size-4" />
        </Button>
        <SearchInput className="hidden sm:flex" onClick={() => setSearchOpen(true)} />
        <ThemeSwitcher />
        <UserDropdown user={user} onSignOut={onSignOut} side="bottom" align="end">
          <Button size="icon" variant="ghost" className="h-fit rounded-full">
            <UserAvatar
              name={user.name}
              image={user.image}
              className="cursor-pointer rounded-full"
            />
          </Button>
        </UserDropdown>
      </div>
    </header>
  );
};
