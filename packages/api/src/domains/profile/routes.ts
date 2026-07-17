import { protectedProcedure } from "../..";

import {
  getMyProfile,
  getMyWorkingHours,
  getOnboardingStatus,
  updateMyWorkingHours,
  updateProfile,
} from "./services";
import {
  getProfileOutputSchema,
  onboardingStatusOutputSchema,
  updateProfileInputSchema,
  updateProfileOutputSchema,
  updateWorkingHoursInputSchema,
  updateWorkingHoursOutputSchema,
  workingHoursOutputSchema,
} from "./validation";

export const profileRoutes = {
  getMyProfile: protectedProcedure
    .output(getProfileOutputSchema)
    .handler(async ({ context }) => getMyProfile(context)),

  getOnboardingStatus: protectedProcedure
    .output(onboardingStatusOutputSchema)
    .handler(async ({ context }) => getOnboardingStatus(context)),

  updateProfile: protectedProcedure
    .input(updateProfileInputSchema)
    .output(updateProfileOutputSchema)
    .handler(async ({ context, input }) => updateProfile(context, input)),

  getMyWorkingHours: protectedProcedure
    .output(workingHoursOutputSchema)
    .handler(async ({ context }) => getMyWorkingHours(context)),

  updateMyWorkingHours: protectedProcedure
    .input(updateWorkingHoursInputSchema)
    .output(updateWorkingHoursOutputSchema)
    .handler(async ({ context, input }) => updateMyWorkingHours(context, input)),
};
