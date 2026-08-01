export const SERVICES_PAGE_SIZE = 9;
export const SERVICES_SELECT_PAGE_SIZE = 500;

export const SERVICE_CATEGORIES = [
  "Рульове управління",
  "Передня підвіска",
  "Задня підвіска",
  "Двигун",
  "Технічне обслуговування",
  "Трансмісія",
  "Гальмівна система",
  "Інше",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
