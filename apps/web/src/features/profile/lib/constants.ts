export const weekdayLabels: Record<number, string> = {
  1: "Понеділок",
  2: "Вівторок",
  3: "Середа",
  4: "Четвер",
  5: "П'ятниця",
  6: "Субота",
  7: "Неділя",
};

export const defaultWorkingHoursDays = [
  { weekday: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 6, openTime: null, closeTime: null, isClosed: true },
  { weekday: 7, openTime: null, closeTime: null, isClosed: true },
] as const satisfies Array<{
  weekday: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}>;
