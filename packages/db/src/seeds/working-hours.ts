import { eq } from "drizzle-orm";

import { organizationWorkingHours } from "../schema/organization-working-hours";
import { profileWorkingHours } from "../schema/profile-working-hours";
import { profiles } from "../schema/profile";
import type { createDb } from "../index";
import {
  DEFAULT_WORKING_HOURS,
  ORGANIZATION_WORKING_HOURS,
  SEED_IDS,
  toTimeValue,
} from "./constants";

type Db = ReturnType<typeof createDb>;

export const seedOrganizationWorkingHours = async (db: Db, organizationId: string) => {
  for (const day of ORGANIZATION_WORKING_HOURS) {
    await db
      .insert(organizationWorkingHours)
      .values({
        id: `seed-owh-${organizationId}-${day.weekday}`,
        organizationId,
        weekday: day.weekday,
        openTime: toTimeValue(day.openTime),
        closeTime: toTimeValue(day.closeTime),
        isClosed: day.isClosed,
      })
      .onConflictDoUpdate({
        target: [organizationWorkingHours.organizationId, organizationWorkingHours.weekday],
        set: {
          openTime: toTimeValue(day.openTime),
          closeTime: toTimeValue(day.closeTime),
          isClosed: day.isClosed,
          updatedAt: new Date(),
        },
      });
  }
};

export const seedProfileWorkingHours = async (db: Db) => {
  const profileRows = await db.select({ id: profiles.id }).from(profiles);
  let seeded = 0;

  for (const profile of profileRows) {
    const existing = await db.query.profileWorkingHours.findMany({
      where: eq(profileWorkingHours.profileId, profile.id),
    });

    if (existing.length > 0) continue;

    await db.insert(profileWorkingHours).values(
      DEFAULT_WORKING_HOURS.map((day) => ({
        id: crypto.randomUUID(),
        profileId: profile.id,
        weekday: day.weekday,
        openTime: toTimeValue(day.openTime),
        closeTime: toTimeValue(day.closeTime),
        isClosed: day.isClosed,
      })),
    );

    seeded += 1;
  }

  return seeded;
};

export const seedAllWorkingHours = async (db: Db) => {
  await seedOrganizationWorkingHours(db, SEED_IDS.organization);
  const profileCount = await seedProfileWorkingHours(db);
  return profileCount;
};
