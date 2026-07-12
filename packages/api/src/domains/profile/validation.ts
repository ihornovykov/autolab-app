import { z } from "zod";

import { profileOutputSchema } from "@autolab/db/validation/profile";
import {
  profileWorkingHoursSelectSchema,
  workingHoursDayInputSchema,
} from "@autolab/db/validation/profile-working-hours";

export const myProfileSchema = profileOutputSchema.extend({
  email: z.string().email(),
  hasPassword: z.boolean(),
});

export const getProfileOutputSchema = myProfileSchema.nullable();
export type GetProfileOutput = z.infer<typeof getProfileOutputSchema>;

export const updateProfileInputSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  birthDate: z.string().nullable().optional(),
  gender: z.enum(["MALE", "FEMALE"]).nullable().optional(),
});

export const updateProfileOutputSchema = profileOutputSchema;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
export type UpdateProfileOutput = z.infer<typeof updateProfileOutputSchema>;

export const updateUsernamePhoneInputSchema = z.object({
  username: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
});

export const updateUsernamePhoneOutputSchema = profileOutputSchema;
export type UpdateUsernamePhoneInput = z.infer<typeof updateUsernamePhoneInputSchema>;
export type UpdateUsernamePhoneOutput = z.infer<typeof updateUsernamePhoneOutputSchema>;

export const workingHoursOutputSchema = z.array(profileWorkingHoursSelectSchema);
export type GetWorkingHoursOutput = z.infer<typeof workingHoursOutputSchema>;

export const updateWorkingHoursInputSchema = z.object({
  days: z
    .array(workingHoursDayInputSchema)
    .length(7)
    .refine((days) => new Set(days.map((day) => day.weekday)).size === 7, {
      message: "Усі дні тижня мають бути вказані",
    })
    .refine(
      (days) =>
        days.every(
          (day) =>
            day.isClosed ||
            (day.openTime &&
              day.closeTime &&
              day.openTime.slice(0, 5) < day.closeTime.slice(0, 5)),
        ),
      { message: "Час закриття має бути пізніше часу відкриття" },
    ),
});

export const updateWorkingHoursOutputSchema = workingHoursOutputSchema;
export type UpdateWorkingHoursInput = z.infer<typeof updateWorkingHoursInputSchema>;
export type UpdateWorkingHoursOutput = z.infer<typeof updateWorkingHoursOutputSchema>;
