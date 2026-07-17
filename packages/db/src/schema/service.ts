import { index, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { organizations } from "./organization";

export const services = pgTable(
  "services",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    category: text("category"),
    title: text("title").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    duration: integer("duration").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_services_organization_id").on(table.organizationId),
    index("idx_services_category").on(table.category),
  ],
);
