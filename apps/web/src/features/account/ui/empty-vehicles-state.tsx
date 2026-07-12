import { Button } from "@autolab/ui/components/button";
import { CarFrontIcon, PlusIcon } from "lucide-react";

import { CreateUserVehicleDialog } from "@/features/vehicle/ui/create-user-vehicle-dialog";
import { dialogs } from "@/shared/stores/dialogs";

export const EmptyVehiclesState = () => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="mb-6 flex size-24 items-center justify-center rounded-lg bg-muted">
      <CarFrontIcon className="size-12 text-muted-foreground" />
    </div>
    <h3 className="mb-2 text-2xl font-semibold">Немає автомобілів</h3>
    <p className="mb-6 text-muted-foreground">
      Ви ще не маєте автомобілів. Почніть з додавання вашого першого автомобіля.
    </p>
    <Button icon={<PlusIcon />} onClick={() => dialogs.open(<CreateUserVehicleDialog />)}>
      Додати автомобіль
    </Button>
  </div>
);
