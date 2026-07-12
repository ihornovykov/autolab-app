import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

import { EmptyVehiclesState } from "@/features/account/ui/empty-vehicles-state";
import { CreateUserVehicleDialog } from "@/features/vehicle/ui/create-user-vehicle-dialog";
import { EditUserVehicleSheet } from "@/features/vehicle/ui/edit-user-vehicle-sheet";
import { VehicleCard } from "@/features/vehicle/ui/vehicle-card";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Button } from "@autolab/ui/components/button";
import { Card } from "@autolab/ui/components/card";

export const VehiclesTab = () => {
  const vehiclesQuery = useQuery(orpc.vehicle.listUserVehicles.queryOptions());

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between p-6">
        <h2 className="text-xl font-semibold">Транспорт</h2>
        <Button icon={<PlusIcon />} onClick={() => dialogs.open(<CreateUserVehicleDialog />)}>
          Додати
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-0">
        {vehiclesQuery.data && vehiclesQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {vehiclesQuery.data.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => sheets.open(<EditUserVehicleSheet vehicle={vehicle} />)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 items-center justify-center">
            <EmptyVehiclesState />
          </div>
        )}
      </div>
    </Card>
  );
};
