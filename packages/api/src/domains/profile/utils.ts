import type { GetProfileOutput } from "./validation";

export const isProfileComplete = (profile: GetProfileOutput) => {
  if (!profile) return false;

  return Boolean(
    profile.firstName?.trim() && profile.lastName?.trim() && profile.phone?.trim(),
  );
};

export const toDbTime = (time: string | null) => {
  if (!time) return null;
  const normalized = time.slice(0, 5);
  return `${normalized}:00`;
};

export const fromDbTime = (time: string | null) => (time ? time.slice(0, 5) : null);
