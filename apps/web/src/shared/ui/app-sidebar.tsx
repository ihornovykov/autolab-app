import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarDaysIcon,
  CalendarIcon,
  CarIcon,
  UserCircleIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import type * as React from "react";

import { useOrganizationStore } from "@/shared/stores/organization";
import { Logo } from "@/shared/ui/logo";
import { OrganizationSwitcher } from "@/shared/ui/organization-switcher";
import { NavUser } from "@/shared/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/shared/ui/sidebar";

type Org = { id: string; name: string; logo?: string | null; address?: string | null };

type Props = {
  organizations: Org[];
  user: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
} & Omit<React.ComponentProps<typeof Sidebar>, "children">;

const navItems = [
  { to: "/dashboard/organization/employees", label: "Працівники", icon: UsersIcon },
  { to: "/dashboard/organization/clients", label: "Клієнти", icon: UserCircleIcon },
  { to: "/dashboard/organization/services", label: "Послуги", icon: WrenchIcon },
  { to: "/dashboard/organization/vehicles", label: "Авто", icon: CarIcon },
  { to: "/dashboard/organization/bookings", label: "Записи", icon: CalendarDaysIcon },
  { to: "/dashboard/organization/calendar", label: "Календар", icon: CalendarIcon },
] as const;

export const AppSidebar = ({ organizations, user, onSignOut, ...props }: Props) => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isMobile, setOpenMobile } = useSidebar();
  const { selectedOrganizationId } = useOrganizationStore();
  const selectedOrg =
    organizations.find((org) => org.id === selectedOrganizationId) ?? organizations[0];

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogoClick = () => {
    closeMobile();
    navigate({ to: "/dashboard" });
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="w-full gap-1 p-2"
          onClick={handleLogoClick}
        >
          <Logo />
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Організація</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = pathname.startsWith(to);
              return (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label} isActive={isActive}>
                    <Link
                      to={to}
                      search={selectedOrg ? { organizationId: selectedOrg.id } : undefined}
                      onClick={closeMobile}
                    >
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <OrganizationSwitcher organizations={organizations} />
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
