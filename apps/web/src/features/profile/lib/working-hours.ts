import z from "zod";

export type WorkingHoursDay = {
  weekday: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export const weekdayLabels: Record<number, string> = {
  1: "Понеділок",
  2: "Вівторок",
  3: "Середа",
  4: "Четвер",
  5: "П'ятниця",
  6: "Субота",
  7: "Неділя",
};

export const defaultWorkingHoursDays: WorkingHoursDay[] = [
  { weekday: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 6, openTime: null, closeTime: null, isClosed: true },
  { weekday: 7, openTime: null, closeTime: null, isClosed: true },
];

const timeValueSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const workingHoursDaySchema = z.object({
  weekday: z.number().int().min(1).max(7),
  openTime: timeValueSchema.nullable(),
  closeTime: timeValueSchema.nullable(),
  isClosed: z.boolean(),
});

export const workingHoursDaysSchema = z
  .array(workingHoursDaySchema)
  .length(7)
  .refine((days) => new Set(days.map((day) => day.weekday)).size === 7, {
    message: "Усі дні тижня мають бути вказані",
  })
  .refine(
    (days) =>
      days.every(
        (day) =>
          day.isClosed ||
          (day.openTime && day.closeTime && day.openTime.slice(0, 5) < day.closeTime.slice(0, 5)),
      ),
    { message: "Час закриття має бути пізніше часу відкриття" },
  );

export const toTimeInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  return value.slice(0, 5);
};

export const mapApiWorkingHoursDays = (rows: WorkingHoursDay[]) =>
  defaultWorkingHoursDays.map((fallback) => {
    const row = rows.find((item) => item.weekday === fallback.weekday);
    if (!row) return fallback;

    return {
      weekday: row.weekday,
      openTime: toTimeInputValue(row.openTime) || fallback.openTime,
      closeTime: toTimeInputValue(row.closeTime) || fallback.closeTime,
      isClosed: row.isClosed,
    };
  });

export const toWorkingHoursMutationInput = (days: WorkingHoursDay[]) =>
  days.map((day) => ({
    weekday: day.weekday,
    isClosed: day.isClosed,
    openTime: day.isClosed ? null : day.openTime,
    closeTime: day.isClosed ? null : day.closeTime,
  }));
