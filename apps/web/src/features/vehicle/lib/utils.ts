import type { SearchableSelectOption } from "@/shared/ui/searchable-select";
import { getSimpleIconsUrl } from "@autolab/env/web";

const MAKE_SLUG_OVERRIDES: Record<string, string> = {
  "Mercedes-Benz": "mercedes",
  Mercedes: "mercedes",
  "Alfa Romeo": "alfaromeo",
  "Land Rover": "landrover",
  "Aston Martin": "astonmartin",
  "Rolls-Royce": "rollsroyce",
  Mini: "mini",
  "Москвич/АЗЛК": "moskvich",
  Москвич: "moskvich",
  Ситроен: "citroen",
  Пежо: "peugeot",
  Рено: "renault",
  Фольксваген: "volkswagen",
  Тойота: "toyota",
  БМВ: "bmw",
  Форд: "ford",
  Ніссан: "nissan",
  Хонда: "honda",
  Хюндай: "hyundai",
  Кіа: "kia",
  Шкода: "skoda",
  Ауді: "audi",
};

export const findOptionLabel = (value: string, options: SearchableSelectOption[]) =>
  options.find((option) => option.value === value)?.label;

const CUSTOM_VALUE_PREFIX = "custom:";

export const isCustomOptionValue = (value: string) => value.startsWith(CUSTOM_VALUE_PREFIX);

export const toCustomOptionValue = (label: string) => `${CUSTOM_VALUE_PREFIX}${label}`;

export const fromCustomOptionValue = (value: string) => value.slice(CUSTOM_VALUE_PREFIX.length);

export const resolveOptionLabel = (value: string, options: SearchableSelectOption[]) => {
  if (isCustomOptionValue(value)) return fromCustomOptionValue(value);
  return findOptionLabel(value, options);
};

export const resolveInitialOptionValue = (
  label: string | null | undefined,
  options: SearchableSelectOption[],
) => {
  if (!label) return "";
  return findOptionValueByLabel(label, options) || toCustomOptionValue(label);
};

export const findOptionValueByLabel = (label: string | null | undefined, options: SearchableSelectOption[]) => {
  if (!label) return "";
  return options.find((option) => option.label === label)?.value ?? "";
};

export const createVehicleSlug = (make: string) => {
  const override = MAKE_SLUG_OVERRIDES[make];
  if (override) return override;

  const latin = make.replace(/[^\x00-\x7F]/g, "").trim();
  if (!latin) return "";

  return latin.toLowerCase().replace(/[^a-z0-9]+/g, "");
};

export const getVehicleIconUrl = (make: string) => {
  const slug = createVehicleSlug(make);
  if (!slug) return null;

  return `${getSimpleIconsUrl()}/${slug}`;
};
