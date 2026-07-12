import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CreateOrganizationForm } from "@/features/organization/ui/create-organization-form";
import { DeleteOrganizationDialog } from "@/features/organization/ui/delete-organization-dialog";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { useOrganizationStore } from "@/shared/stores/organization";
import { sheets } from "@/shared/stores/sheets";
import { OrganizationLogo } from "@/shared/ui/organization-logo";
import { RoleBadge } from "@/shared/ui/role-badge";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";
import { cn } from "@autolab/ui/lib/utils";

const FORM_ID = "edit-organization-form";

type Organization = {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  role: "TECHNICIAN" | "MANAGER" | "OWNER";
};

type Props = {
  organization: Organization;
};

export const EditOrganizationSheet = ({ organization }: Props) => {
  const queryClient = useQueryClient();
  const selectedOrganizationId = useOrganizationStore((state) => state.selectedOrganizationId);
  const setSelectedOrganizationId = useOrganizationStore(
    (state) => state.setSelectedOrganizationId,
  );

  const updateMutation = useMutation(
    orpc.organization.updateOrganization.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
        toast.success("Організацію оновлено");
        sheets.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити організацію");
      },
    }),
  );

  const handleDeleteClick = () => {
    sheets.close();
    dialogs.open(
      <DeleteOrganizationDialog
        organizationId={organization.id}
        name={organization.name}
        onDeleted={() => {
          if (selectedOrganizationId === organization.id) {
            setSelectedOrganizationId(null);
          }
        }}
      />,
    );
  };

  const isBusy = updateMutation.isPending;
  const canDelete = organization.role === "OWNER";

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title={organization.name}
      description="Редагування організації"
      className="sm:max-w-3xl"
      footer={
        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:items-center",
            canDelete ? "sm:justify-between" : "sm:justify-end",
          )}
        >
          {canDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="default"
              disabled={isBusy}
              onClick={handleDeleteClick}
            >
              Видалити
            </Button>
          ) : null}
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={isBusy}
              onClick={() => sheets.close()}
            >
              Закрити
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              size="default"
              loading={updateMutation.isPending}
            >
              Зберегти зміни
            </Button>
          </div>
        </div>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <OrganizationLogo
          name={organization.name}
          image={organization.logo}
          className="size-12 rounded-xl"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{organization.name}</p>
          <div className="mt-1">
            <RoleBadge role={organization.role} />
          </div>
        </div>
      </div>

      <CreateOrganizationForm
        formId={FORM_ID}
        initialOrganization={organization}
        onSubmit={(values) =>
          updateMutation.mutate({
            organizationId: organization.id,
            ...values,
          })
        }
      />
    </Sheet>
  );
};
