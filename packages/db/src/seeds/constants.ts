export const SEED_PASSWORD = "Autolab123!";

export const SEED_IDS = {
  organization: "seed-org-autolab-pechersk",
  users: {
    owner: "seed-user-owner",
    manager: "seed-user-manager",
    technicianDmytro: "seed-user-tech-dmytro",
    technicianAndrii: "seed-user-tech-andrii",
    clientMaria: "seed-user-client-maria",
  },
} as const;

export const DEFAULT_WORKING_HOURS = [
  { weekday: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { weekday: 6, openTime: null, closeTime: null, isClosed: true },
  { weekday: 7, openTime: null, closeTime: null, isClosed: true },
] as const;

export const ORGANIZATION_WORKING_HOURS = [
  { weekday: 1, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { weekday: 2, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { weekday: 3, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { weekday: 4, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { weekday: 5, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { weekday: 6, openTime: "09:00", closeTime: "15:00", isClosed: false },
  { weekday: 7, openTime: null, closeTime: null, isClosed: true },
] as const;

export const toTimeValue = (time: string | null) => (time ? `${time}:00` : null);
