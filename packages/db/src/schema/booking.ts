import { boolean, index, integer, numeric, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

import { employees } from "./employee";
import { bookingStatusEnum } from "./enums";
import { organizations } from "./organization";
import { services } from "./service";
import { vehicles } from "./vehicle";

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "restrict" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    allowsOvertime: boolean("allows_overtime").default(false).notNull(),
    status: bookingStatusEnum("status").default("PENDING").notNull(),
    notes: text("notes"),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_bookings_organization_id").on(table.organizationId),
    index("idx_bookings_employee_id").on(table.employeeId),
    index("idx_bookings_vehicle_id").on(table.vehicleId),
    index("idx_bookings_start_time").on(table.startTime),
  ],
);

export const bookingServices = pgTable(
  "booking_services",
  {
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    duration: integer("duration").notNull(),
  },
  (table) => [primaryKey({ columns: [table.bookingId, table.serviceId] })],
);
