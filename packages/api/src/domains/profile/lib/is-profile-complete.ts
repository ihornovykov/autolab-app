import type { GetProfileOutput } from "../validation";

export const isProfileComplete = (profile: GetProfileOutput) => {
  if (!profile) return false;

  return Boolean(
    profile.firstName?.trim() && profile.lastName?.trim() && profile.phone?.trim(),
  );
};
