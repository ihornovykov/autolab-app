import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

import { EmptyOrganizationsState } from "@/features/account/ui/empty-organizations-state";
import { CreateOrganizationDialog } from "@/features/organization/ui/create-organization-dialog";
import { EditOrganizationSheet } from "@/features/organization/ui/edit-organization-sheet";
import { OrganizationCard } from "@/features/organization/ui/organization-card";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Button } from "@autolab/ui/components/button";
import { Card } from "@autolab/ui/components/card";

export const OrganizationsTab = () => {
  const organizationsQuery = useQuery(orpc.organization.listMyOrganizations.queryOptions());

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between p-6">
        <h2 className="text-xl font-semibold">Організації</h2>
        <Button icon={<PlusIcon />} onClick={() => dialogs.open(<CreateOrganizationDialog />)}>
          Створити
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-0">
        {organizationsQuery.data && organizationsQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {organizationsQuery.data.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                onClick={
                  organization.role !== "TECHNICIAN"
                    ? () => sheets.open(<EditOrganizationSheet organization={organization} />)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[12rem] items-center justify-center">
            <EmptyOrganizationsState />
          </div>
        )}
      </div>
    </Card>
  );
};
