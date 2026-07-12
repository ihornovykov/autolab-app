import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import { accounts, users } from "../schema/auth";
import { profiles } from "../schema/profile";
import type { createDb } from "../index";

type Db = ReturnType<typeof createDb>;

export type SeedUserInput = {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  username?: string;
};

export const ensureSeedUser = async (db: Db, user: SeedUserInput, password: string) => {
  const [existingUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
  const userId = existingUser?.id ?? user.id;

  if (!existingUser) {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: true,
    });
  }

  const [existingAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);

  if (!existingAccount) {
    const hashedPassword = await hashPassword(password);
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    });
  }

  const profileId = `profile-${userId}`;
  await db
    .insert(profiles)
    .values({
      id: profileId,
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      username: user.username,
      phone: user.phone,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        username: user.username,
        phone: user.phone,
        updatedAt: new Date(),
      },
    });

  return userId;
};
