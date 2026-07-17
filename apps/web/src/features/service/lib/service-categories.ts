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
