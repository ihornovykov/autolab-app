import { date, index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { genderEnum } from "./enums";
import { users } from "./auth";

export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    middleName: text("middle_name"),
    username: text("username"),
    phone: text("phone"),
    birthDate: date("birth_date"),
    gender: genderEnum("gender"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_profiles_user_id").on(table.userId),
    unique("uq_profiles_username").on(table.username),
    unique("uq_profiles_phone").on(table.phone),
    index("idx_profiles_user_id").on(table.userId),
  ],
);
