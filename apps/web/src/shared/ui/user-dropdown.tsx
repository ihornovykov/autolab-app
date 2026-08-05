import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@autolab/ui/components/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { UserAvatar } from "@/shared/ui/user-avatar";

type Props = {
  user: { name: string; email: string; image?: string | null };
  onSignOut: () => void;
  onNavigate?: () => void;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  children: ReactElement;
};

export const UserDropdown = ({
  user,
  onSignOut,
  onNavigate,
  align = "end",
  side = "bottom",
  children,
}: Props) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    onNavigate?.();
    navigate({ to: "/dashboard/account/settings" });
  };

  const handleSignOut = () => {
    onNavigate?.();
    onSignOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={4}
        className="min-w-56 rounded-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar name={user.name} image={user.image} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettingsClick}>Налаштування</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Вихід</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
