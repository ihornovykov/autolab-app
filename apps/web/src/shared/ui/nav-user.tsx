import { ChevronsUpDown } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import { UserAvatar } from "@/shared/ui/user-avatar";
import { UserDropdown } from "@/shared/ui/user-dropdown";

type Props = {
  user: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
};

export const NavUser = ({ user, onSignOut }: Props) => {
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserDropdown
          user={user}
          onSignOut={onSignOut}
          onNavigate={closeMobile}
          side={isMobile ? "bottom" : "right"}
          align="end"
        >
          <SidebarMenuButton
            size="lg"
            className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
          >
            <UserAvatar name={user.name} image={user.image} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-60" />
          </SidebarMenuButton>
        </UserDropdown>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
