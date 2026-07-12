import { doublePrecision, index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    description: text("description"),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_organizations_slug").on(table.slug),
    index("idx_organizations_slug").on(table.slug),
  ],
);
