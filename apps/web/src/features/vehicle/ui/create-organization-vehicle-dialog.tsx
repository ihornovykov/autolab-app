import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { UserVehicleForm, UserVehicleFormSkeleton } from "@/features/vehicle/ui/user-vehicle-form";
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";
import { getClientName } from "@/shared/lib/client";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

const FORM_ID = "create-organization-vehicle-form";

type Props = {
  organizationId: string;
};

export const CreateOrganizationVehicleDialog = ({ organizationId }: Props) => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    ...orpc.client.listClients.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const createMutation = useMutation(
    orpc.vehicle.createVehicle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.vehicle.key() });
        toast.success("Автомобіль додано");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося додати автомобіль");
      },
    }),
  );

  const clients = (clientsQuery.data?.items ?? []).map((client) => ({
    id: client.id,
    label: getClientName(client),
  }));

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Додати авто"
      description="Заповніть дані транспортного засобу клієнта організації"
      className="max-w-[700px]"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending || clientsQuery.isLoading}
            onClick={() => dialogs.close()}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            icon={<PlusIcon />}
            loading={createMutation.isPending}
            disabled={clientsQuery.isLoading || clients.length === 0}
          >
            Додати
          </Button>
        </div>
      }
    >
      {clientsQuery.isLoading ? (
        <UserVehicleFormSkeleton />
      ) : clients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Спочатку додайте клієнта, щоб прив&apos;язати до нього автомобіль.
        </p>
      ) : (
        <UserVehicleForm
          formId={FORM_ID}
          clients={clients}
          onSubmit={(values) => {
            const { clientId, ...vehicle } = values;
            createMutation.mutate({
              organizationId,
              clientId,
              ...vehicle,
            });
          }}
        />
      )}
    </Dialog>
  );
};
