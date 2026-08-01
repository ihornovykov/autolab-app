export type WorkingHoursDay = {
  weekday: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};
