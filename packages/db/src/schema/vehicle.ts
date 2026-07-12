import { doublePrecision, index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { clients } from "./client";
import { vehicleTypeEnum } from "./enums";

export const vehicles = pgTable(
  "vehicles",
  {
    id: text("id").primaryKey(),
    type: vehicleTypeEnum("type").default("CAR").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    licensePlate: text("license_plate"),
    vin: text("vin"),
    engine: text("engine"),
    engineVolume: doublePrecision("engine_volume"),
    bodyStyle: text("body_style"),
    notes: text("notes"),
    clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_vehicles_vin").on(table.vin),
    index("idx_vehicles_client_id").on(table.clientId),
    index("idx_vehicles_user_id").on(table.userId),
  ],
);

export const vehicleMakes = pgTable("vehicle_makes", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const vehicleModels = pgTable(
  "vehicle_models",
  {
    id: text("id").primaryKey(),
    makeId: text("make_id")
      .notNull()
      .references(() => vehicleMakes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    yearFrom: integer("year_from"),
    yearTo: integer("year_to"),
  },
  (table) => [index("idx_vehicle_models_make_id").on(table.makeId)],
);
