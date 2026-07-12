import { boolean, index, integer, pgTable, text, time, timestamp, unique } from "drizzle-orm/pg-core";

import { profiles } from "./profile";

export const profileWorkingHours = pgTable(
  "profile_working_hours",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
    openTime: time("open_time"),
    closeTime: time("close_time"),
    isClosed: boolean("is_closed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_profile_working_hours_profile_weekday").on(table.profileId, table.weekday),
    index("idx_profile_working_hours_profile_id").on(table.profileId),
  ],
);
