import { db } from "@autolab/db";
import { accounts } from "@autolab/db/schema/auth";
import { profileWorkingHours } from "@autolab/db/schema/profile-working-hours";
import { profiles } from "@autolab/db/schema/profile";
import { ORPCError } from "@orpc/server";
import { and, eq, inArray } from "drizzle-orm";

import type { Context } from "../../context";
import { DEFAULT_WORKING_HOURS, mapDbWorkingHours } from "../../lib/working-hours";
import { createId } from "../../lib/org-scope";

import type {
  GetProfileOutput,
  GetWorkingHoursOutput,
  UpdateProfileInput,
  UpdateProfileOutput,
  UpdateUsernamePhoneInput,
  UpdateUsernamePhoneOutput,
  UpdateWorkingHoursInput,
  UpdateWorkingHoursOutput,
} from "./validation";

const toDbTime = (time: string | null) => {
  if (!time) return null;
  const normalized = time.slice(0, 5);
  return `${normalized}:00`;
};

const fromDbTime = (time: string | null) => (time ? time.slice(0, 5) : null);

export const seedDefaultProfileWorkingHours = async (profileId: string) => {
  await db.insert(profileWorkingHours).values(
    DEFAULT_WORKING_HOURS.map((day) => ({
      id: createId(),
      profileId,
      weekday: day.weekday,
      openTime: day.openTime ? toDbTime(day.openTime) : null,
      closeTime: day.closeTime ? toDbTime(day.closeTime) : null,
      isClosed: day.isClosed,
    })),
  );
};

const getCredentialAccount = async (userId: string) =>
  db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.providerId, "credential")),
    columns: { password: true },
  });

export const getMyProfile = async (context: Context): Promise<GetProfileOutput> => {
  const session = context.session;
  if (!session?.user.id) return null;

  const userId = session.user.id;

  let profile =
    (await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    })) ?? null;

  if (!profile) {
    const [created] = await db
      .insert(profiles)
      .values({
        id: createId(),
        userId,
      })
      .returning();

    if (!created) return null;

    await seedDefaultProfileWorkingHours(created.id);
    profile = created;
  }

  if (!profile) return null;

  const credentialAccount = await getCredentialAccount(userId);

  return {
    ...profile,
    email: session.user.email,
    hasPassword: !!credentialAccount?.password,
  };
};

export const updateProfile = async (
  context: Context,
  input: UpdateProfileInput,
): Promise<UpdateProfileOutput> => {
  const userId = context.session!.user.id;

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
  }

  const [updated] = await db
    .update(profiles)
    .set({
      firstName: input.firstName ?? existing.firstName,
      lastName: input.lastName ?? existing.lastName,
      middleName: input.middleName ?? existing.middleName,
      birthDate: input.birthDate === undefined ? existing.birthDate : input.birthDate,
      gender: input.gender === undefined ? existing.gender : input.gender,
    })
    .where(eq(profiles.userId, userId))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
  }

  return updated;
};

export const updateUsernamePhone = async (
  context: Context,
  input: UpdateUsernamePhoneInput,
): Promise<UpdateUsernamePhoneOutput> => {
  const userId = context.session!.user.id;

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
  }

  const [updated] = await db
    .update(profiles)
    .set({
      username: input.username ?? existing.username,
      phone: input.phone ?? existing.phone,
    })
    .where(eq(profiles.userId, userId))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
  }

  return updated;
};

export const getMyWorkingHours = async (context: Context): Promise<GetWorkingHoursOutput> => {
  const userId = context.session?.user.id;
  if (!userId) return [];

  let profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile) {
    const [created] = await db.insert(profiles).values({ id: createId(), userId }).returning();

    if (!created) return [];

    await seedDefaultProfileWorkingHours(created.id);
    profile = created;
  }

  if (!profile) return [];

  let rows = await db.query.profileWorkingHours.findMany({
    where: eq(profileWorkingHours.profileId, profile.id),
    orderBy: (table, { asc }) => [asc(table.weekday)],
  });

  if (rows.length === 0) {
    await seedDefaultProfileWorkingHours(profile.id);
    rows = await db.query.profileWorkingHours.findMany({
      where: eq(profileWorkingHours.profileId, profile.id),
      orderBy: (table, { asc }) => [asc(table.weekday)],
    });
  }

  return rows.map((row) => ({
    ...row,
    openTime: fromDbTime(row.openTime),
    closeTime: fromDbTime(row.closeTime),
  }));
};

export const updateMyWorkingHours = async (
  context: Context,
  input: UpdateWorkingHoursInput,
): Promise<UpdateWorkingHoursOutput> => {
  const userId = context.session?.user.id;
  if (!userId) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile) {
    throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
  }

  for (const day of input.days) {
    await db
      .insert(profileWorkingHours)
      .values({
        id: createId(),
        profileId: profile.id,
        weekday: day.weekday,
        openTime: day.isClosed ? null : toDbTime(day.openTime),
        closeTime: day.isClosed ? null : toDbTime(day.closeTime),
        isClosed: day.isClosed,
      })
      .onConflictDoUpdate({
        target: [profileWorkingHours.profileId, profileWorkingHours.weekday],
        set: {
          openTime: day.isClosed ? null : toDbTime(day.openTime),
          closeTime: day.isClosed ? null : toDbTime(day.closeTime),
          isClosed: day.isClosed,
          updatedAt: new Date(),
        },
      });
  }

  return getMyWorkingHours(context);
};

export const createProfileForUser = async (userId: string) => {
  const [profile] = await db
    .insert(profiles)
    .values({
      id: createId(),
      userId,
    })
    .onConflictDoNothing()
    .returning();

  if (profile) await seedDefaultProfileWorkingHours(profile.id);

  return profile;
};

export const getWorkingHoursForUserId = async (userId: string) => {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: {
      workingHours: {
        orderBy: (table, { asc }) => [asc(table.weekday)],
      },
    },
  });

  if (!profile?.workingHours?.length) return DEFAULT_WORKING_HOURS;

  return mapDbWorkingHours(profile.workingHours);
};

export const getWorkingHoursForUserIds = async (userIds: string[]) => {
  const uniqueUserIds = [...new Set(userIds)];
  const map = new Map(uniqueUserIds.map((userId) => [userId, DEFAULT_WORKING_HOURS]));

  if (!uniqueUserIds.length) return map;

  const profileRows = await db.query.profiles.findMany({
    where: inArray(profiles.userId, uniqueUserIds),
    with: {
      workingHours: {
        orderBy: (table, { asc }) => [asc(table.weekday)],
      },
    },
  });

  for (const profile of profileRows) {
    map.set(
      profile.userId,
      profile.workingHours.length ? mapDbWorkingHours(profile.workingHours) : DEFAULT_WORKING_HOURS,
    );
  }

  return map;
};
