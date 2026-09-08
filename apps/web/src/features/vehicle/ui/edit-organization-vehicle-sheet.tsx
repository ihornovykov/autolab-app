import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useEnsureClient } from "@/features/client/hooks/use-ensure-client";
import { DeleteOrganizationVehicleDialog } from "@/features/vehicle/ui/delete-organization-vehicle-dialog";
import { UserVehicleForm, UserVehicleFormSkeleton } from "@/features/vehicle/ui/user-vehicle-form";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";
import { getClientName } from "@/shared/lib/client";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";

const FORM_ID = "edit-organization-vehicle-form";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
  client?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    middleName?: string | null;
  } | null;
};

type Props = {
  vehicle: Vehicle;
  organizationId: string;
  onDeleted?: () => void;
};

export const EditOrganizationVehicleSheet = ({ vehicle, organizationId, onDeleted }: Props) => {
  const queryClient = useQueryClient();
  const { ensureClientId, isEnsuringClient } = useEnsureClient(organizationId);

  const clientsQuery = useQuery({
    ...orpc.client.listClients.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const updateMutation = useMutation(
    orpc.vehicle.updateVehicle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.vehicle.key() });
        toast.success("Автомобіль оновлено");
        sheets.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити автомобіль");
      },
    }),
  );

  const handleDeleteClick = () => {
    sheets.close();
    dialogs.open(
      <DeleteOrganizationVehicleDialog
        organizationId={organizationId}
        vehicleId={vehicle.id}
        make={vehicle.make}
        model={vehicle.model}
        onDeleted={onDeleted}
      />,
    );
  };

  const clients = (clientsQuery.data?.items ?? []).map((client) => ({
    id: client.id,
    label: getClientName(client),
  }));

  const isBusy = updateMutation.isPending || isEnsuringClient;

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title={`${vehicle.make} ${vehicle.model}`}
      description="Редагування транспортного засобу"
      className="sm:max-w-xl"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="destructive" disabled={isBusy} onClick={handleDeleteClick}>
            Видалити
          </Button>
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => sheets.close()}
            >
              Закрити
            </Button>
            <Button type="submit" form={FORM_ID} loading={isBusy} disabled={clientsQuery.isLoading}>
              Зберегти зміни
            </Button>
          </div>
        </div>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <VehicleMakeIcon make={vehicle.make} className="size-12" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-xs text-muted-foreground">{vehicle.year} рік</p>
          {vehicle.client ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {getClientName(vehicle.client)}
            </p>
          ) : null}
        </div>
      </div>

      {clientsQuery.isLoading ? (
        <UserVehicleFormSkeleton />
      ) : (
        <UserVehicleForm
          formId={FORM_ID}
          clients={clients}
          initialClientId={vehicle.client?.id}
          initialVehicle={vehicle}
          onSubmit={async (values) => {
            const { clientId, newClient, ...vehicleValues } = values;

            try {
              const nextClientId = await ensureClientId({ clientId, newClient });
              updateMutation.mutate({
                organizationId,
                vehicleId: vehicle.id,
                clientId: nextClientId,
                ...vehicleValues,
              });
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Не вдалося створити клієнта",
              );
            }
          }}
        />
      )}
    </Sheet>
  );
};
