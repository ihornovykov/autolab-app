import { useQuery } from "@tanstack/react-query";

import {
  bodyStyleOptions,
  fuelOptions,
  makeOptions,
} from "@/features/vehicle/lib/constants";
import { orpc } from "@/shared/api/orpc";
import type { SearchableSelectOption } from "@/shared/ui/searchable-select";

export const useVehicleMakes = () => ({
  options: makeOptions,
  isLoading: false,
  isError: false,
});

export const useVehicleModels = (makeId: string) => {
  const modelsQuery = useQuery({
    ...orpc.vehicle.getModels.queryOptions({ input: { makeId } }),
    enabled: !!makeId,
  });

  const options: SearchableSelectOption[] =
    modelsQuery.data?.map((model) => ({
      value: model.id,
      label: model.name,
    })) ?? [];

  return {
    options,
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
  };
};

export { bodyStyleOptions, fuelOptions, makeOptions };
