import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

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
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_profiles_user_id").on(table.userId),
    unique("uq_profiles_phone").on(table.phone),
    index("idx_profiles_user_id").on(table.userId),
  ],
);
