import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api/orpc";
import type { SearchableSelectOption } from "@/shared/ui/searchable-select";

import bodystylesJson from "./bodystyles.json";
import fuelsJson from "./fuels.json";
import makesJson from "./makes.json";

export const makeOptions: SearchableSelectOption[] = makesJson.map((item) => ({
  value: String(item.value),
  label: item.label,
}));

export const bodyStyleOptions: SearchableSelectOption[] = bodystylesJson.map((item) => ({
  value: String(item.value),
  label: item.label,
}));

export const fuelOptions: SearchableSelectOption[] = fuelsJson.map((item) => ({
  value: String(item.value),
  label: item.label,
}));

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
