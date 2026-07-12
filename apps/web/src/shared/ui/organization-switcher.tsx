import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@autolab/ui/components/dropdown-menu";
import { ChevronsUpDown, Plus } from "lucide-react";

import { CreateOrganizationDialog } from "@/features/organization/ui/create-organization-dialog";
import { dialogs } from "@/shared/stores/dialogs";
import { useOrganizationStore } from "@/shared/stores/organization";
import { OrganizationLogo } from "@/shared/ui/organization-logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";

type Org = { id: string; name: string; logo?: string | null; address?: string | null };

type Props = {
  organizations: Org[];
};

export const OrganizationSwitcher = ({ organizations }: Props) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();
  const selectedOrg =
    organizations.find((org) => org.id === selectedOrganizationId) ?? organizations[0];

  const handleOrganizationChange = (organizationId: string) => {
    setSelectedOrganizationId(organizationId);
    if (isMobile) setOpenMobile(false);
  };

  if (!organizations.length) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
            onClick={() => dialogs.open(<CreateOrganizationDialog />)}
          >
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">Створити організацію</div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <OrganizationLogo
                name={selectedOrg?.name ?? ""}
                image={selectedOrg?.logo}
                className="rounded-lg"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {selectedOrg?.name ?? "Не знайдено"}
              </span>
            </div>
            {organizations.length ? (
              <ChevronsUpDown className="ml-auto size-4" />
            ) : (
              <Plus className="size-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Організації
              </DropdownMenuLabel>
              {organizations.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  className="gap-2 p-1"
                  onClick={() => handleOrganizationChange(organization.id)}
                >
                  <OrganizationLogo
                    image={organization.logo}
                    name={organization.name}
                    className="rounded-lg"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{organization.name}</span>
                    <span className="max-w-[160px] truncate text-[12px]">
                      {organization.address}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              {organizations.length === 0 ? (
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => dialogs.open(<CreateOrganizationDialog />)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Створити</div>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
