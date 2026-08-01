import z from "zod";

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
