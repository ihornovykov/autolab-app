import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { useEnsureClient } from "@/features/client/hooks/use-ensure-client";
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
  const { ensureClientId, isEnsuringClient } = useEnsureClient(organizationId);

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

  const isBusy = createMutation.isPending || isEnsuringClient;

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
            disabled={isBusy || clientsQuery.isLoading}
            onClick={() => dialogs.close()}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            icon={<PlusIcon />}
            loading={isBusy}
            disabled={clientsQuery.isLoading}
          >
            Додати
          </Button>
        </div>
      }
    >
      {clientsQuery.isLoading ? (
        <UserVehicleFormSkeleton />
      ) : (
        <UserVehicleForm
          formId={FORM_ID}
          clients={clients}
          onSubmit={async (values) => {
            const { clientId, newClient, ...vehicle } = values;

            try {
              const nextClientId = await ensureClientId({ clientId, newClient });
              createMutation.mutate({
                organizationId,
                clientId: nextClientId,
                ...vehicle,
              });
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Не вдалося створити клієнта",
              );
            }
          }}
        />
      )}
    </Dialog>
  );
};
