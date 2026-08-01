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
