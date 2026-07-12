import { boolean, index, integer, pgTable, text, time, timestamp, unique } from "drizzle-orm/pg-core";

import { organizations } from "./organization";

export const organizationWorkingHours = pgTable(
  "organization_working_hours",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
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
    unique("uq_org_working_hours_org_weekday").on(table.organizationId, table.weekday),
    index("idx_org_working_hours_organization_id").on(table.organizationId),
  ],
);
