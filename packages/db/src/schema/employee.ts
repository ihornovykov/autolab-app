import { boolean, index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { employeeRoleEnum } from "./enums";
import { organizations } from "./organization";

export const employees = pgTable(
  "employees",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: employeeRoleEnum("role").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_employees_user_org").on(table.userId, table.organizationId),
    index("idx_employees_organization_id").on(table.organizationId),
    index("idx_employees_user_id").on(table.userId),
  ],
);
