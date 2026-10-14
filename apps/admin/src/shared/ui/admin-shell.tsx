import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@autolab/ui/components/dropdown-menu";
import { Separator } from "@autolab/ui/components/separator";
import { cn } from "@autolab/ui/lib/utils";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Building2Icon,
  CarIcon,
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  ShieldIcon,
  SunIcon,
  UserRoundIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, type ReactNode } from "react";

import { authClient } from "@/shared/lib/auth";
import { Logo } from "@/shared/ui/logo";

const platformNav = [
  { to: "/overview", label: "Огляд", icon: LayoutDashboardIcon },
  { to: "/organizations", label: "Організації", icon: Building2Icon },
  { to: "/users", label: "Користувачі", icon: UsersIcon },
] as const;

const systemNav = [
  { to: "/catalog/makes", label: "Каталог", icon: CarIcon },
  { to: "/admins", label: "Адміни", icon: ShieldIcon },
] as const;

type NavItem = (typeof platformNav)[number] | (typeof systemNav)[number];

const themes = [
  { id: "light", label: "Світла", icon: SunIcon },
  { id: "dark", label: "Темна", icon: MoonIcon },
  { id: "system", label: "Системна", icon: MonitorIcon },
] as const;

export const AdminShell = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: session } = authClient.useSession();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const user = session?.user;

  const onSignOut = () => {
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/sign-in";
        },
      },
    });
  };

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <aside className="hidden w-72 shrink-0 p-3 md:block">
        <SidebarBody pathname={pathname} user={user} onSignOut={onSignOut} />
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
          <button
            type="button"
            className="rounded-md p-2 hover:bg-muted"
            aria-label={isMobileNavOpen ? "Закрити меню" : "Відкрити меню"}
            onClick={() => setIsMobileNavOpen((open) => !open)}
          >
            {isMobileNavOpen ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
          <Logo />
        </div>
        {isMobileNavOpen ? (
          <div className="max-h-[70svh] overflow-auto border-b border-border md:hidden">
            <SidebarBody
              pathname={pathname}
              user={user}
              onSignOut={onSignOut}
              onNavigate={() => setIsMobileNavOpen(false)}
              className="h-auto rounded-none border-0 shadow-none"
            />
          </div>
        ) : null}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

type SidebarProps = {
  pathname: string;
  user?: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
  onNavigate?: () => void;
  className?: string;
};

const SidebarBody = ({ pathname, user, onSignOut, onNavigate, className }: SidebarProps) => (
  <div
    className={cn(
      "flex h-full flex-col rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm",
      className,
    )}
  >
    <div className="px-4 py-4">
      <Link to="/overview" onClick={onNavigate} className="block rounded-md">
        <Logo />
      </Link>
    </div>
    <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-3">
      <NavGroup label="Платформа" items={platformNav} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup label="Система" items={systemNav} pathname={pathname} onNavigate={onNavigate} />
    </nav>
    <div className="space-y-3 p-3">
      <ThemeChoices />
      <Separator />
      {user ? <UserFooter user={user} onSignOut={onSignOut} /> : null}
    </div>
  </div>
);

const NavGroup = ({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: readonly NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) => (
  <div className="grid gap-1">
    <p className="px-3 text-xs font-medium text-muted-foreground">{label}</p>
    {items.map((item) => {
      const current = pathname.replace(/\/$/, "") || "/";
      const target = item.to.replace(/\/$/, "") || "/";
      const active = current === target || current.startsWith(`${target}/`);
      const Icon = item.icon;
      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={cn(
            "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            active && "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          <Icon className="size-4" />
          <span>{item.label}</span>
        </Link>
      );
    })}
  </div>
);

const ThemeChoices = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1">
      {themes.map((item) => {
        const Icon = item.icon;
        const selected = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={() => setTheme(item.id)}
            className={cn(
              "flex h-8 items-center justify-center rounded-md text-muted-foreground",
              selected && "bg-background text-foreground shadow-sm",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
};

const UserFooter = ({
  user,
  onSignOut,
}: {
  user: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-sidebar-accent"
        >
          <UserMark name={user.name} image={user.image} />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-60" />
        </button>
      }
    />
    <DropdownMenuContent align="end" side="top" sideOffset={8} className="min-w-56 rounded-lg">
      <DropdownMenuLabel className="font-normal">
        <span className="block truncate font-semibold">{user.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut}>
        <LogOutIcon className="opacity-60" />
        Вийти
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const UserMark = ({ name, image }: { name: string; image?: string | null }) => (
  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
    {image ? (
      <img src={image} alt={name} className="size-full object-cover" />
    ) : (
      <UserRoundIcon size={16} className="opacity-60" />
    )}
  </div>
);

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export const PageHeader = ({ title, description, children }: PageHeaderProps) => (
  <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p> : null}
    </div>
    {children}
  </div>
);
