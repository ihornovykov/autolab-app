import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { organizations } from "./organization";

export const clients = pgTable(
  "clients",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    firstName: text("first_name").notNull(),
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
    index("idx_clients_organization_id").on(table.organizationId),
    index("idx_clients_user_id").on(table.userId),
  ],
);
