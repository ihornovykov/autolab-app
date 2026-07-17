import { Button } from "@autolab/ui/components/button";
import { Separator } from "@autolab/ui/components/separator";
import { SearchIcon } from "lucide-react";

import { SearchInput } from "@/shared/ui/search-input";
import { useGlobalSearchStore } from "@/features/search/model/global-search-store";
import { DashboardBreadcrumbs } from "@/shared/ui/dashboard-breadcrumbs";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";
import { UserAvatar } from "@/shared/ui/user-avatar";
import { UserDropdown } from "@/shared/ui/user-dropdown";

type Props = {
  user: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
};

export const DashboardTopbar = ({ user, onSignOut }: Props) => {
  const setSearchOpen = useGlobalSearchStore((state) => state.setOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 bg-background pr-4">
      <div className="flex min-w-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DashboardBreadcrumbs />
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
