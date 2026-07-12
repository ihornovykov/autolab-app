import { protectedProcedure } from "../..";

import {
  getMyProfile,
  getMyWorkingHours,
  updateMyWorkingHours,
  updateProfile,
  updateUsernamePhone,
} from "./services";
import {
  getProfileOutputSchema,
  updateProfileInputSchema,
  updateProfileOutputSchema,
  updateUsernamePhoneInputSchema,
  updateUsernamePhoneOutputSchema,
  updateWorkingHoursInputSchema,
  updateWorkingHoursOutputSchema,
  workingHoursOutputSchema,
} from "./validation";

export const profileRoutes = {
  getMyProfile: protectedProcedure
    .output(getProfileOutputSchema)
    .handler(async ({ context }) => getMyProfile(context)),

  updateProfile: protectedProcedure
    .input(updateProfileInputSchema)
    .output(updateProfileOutputSchema)
    .handler(async ({ context, input }) => updateProfile(context, input)),

  updateUsernamePhone: protectedProcedure
    .input(updateUsernamePhoneInputSchema)
    .output(updateUsernamePhoneOutputSchema)
    .handler(async ({ context, input }) => updateUsernamePhone(context, input)),

  getMyWorkingHours: protectedProcedure
    .output(workingHoursOutputSchema)
    .handler(async ({ context }) => getMyWorkingHours(context)),

  updateMyWorkingHours: protectedProcedure
    .input(updateWorkingHoursInputSchema)
    .output(updateWorkingHoursOutputSchema)
    .handler(async ({ context, input }) => updateMyWorkingHours(context, input)),
};
