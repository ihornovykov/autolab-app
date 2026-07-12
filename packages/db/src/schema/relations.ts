import { relations } from "drizzle-orm";

import { users, accounts, sessions } from "./auth";
import { bookingServices, bookings } from "./booking";
import { clients } from "./client";
import { employees } from "./employee";
import { organizationWorkingHours } from "./organization-working-hours";
import { organizations } from "./organization";
import { profileWorkingHours } from "./profile-working-hours";
import { profiles } from "./profile";
import { services } from "./service";
import { vehicleMakes, vehicleModels, vehicles } from "./vehicle";

export const usersExtendedRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  employees: many(employees),
  clients: many(clients),
  vehicles: many(vehicles),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  workingHours: many(profileWorkingHours),
}));

export const profileWorkingHoursRelations = relations(profileWorkingHours, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileWorkingHours.profileId],
    references: [profiles.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  employees: many(employees),
  services: many(services),
  clients: many(clients),
  bookings: many(bookings),
  workingHours: many(organizationWorkingHours),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [employees.organizationId],
    references: [organizations.id],
  }),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [services.organizationId],
    references: [organizations.id],
  }),
  bookingServices: many(bookingServices),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  client: one(clients, {
    fields: [vehicles.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [bookings.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [bookings.employeeId],
    references: [employees.id],
  }),
  vehicle: one(vehicles, {
    fields: [bookings.vehicleId],
    references: [vehicles.id],
  }),
  bookingServices: many(bookingServices),
}));

export const bookingServicesRelations = relations(bookingServices, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingServices.bookingId],
    references: [bookings.id],
  }),
  service: one(services, {
    fields: [bookingServices.serviceId],
    references: [services.id],
  }),
}));

export const organizationWorkingHoursRelations = relations(organizationWorkingHours, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationWorkingHours.organizationId],
    references: [organizations.id],
  }),
}));

export const vehicleMakesRelations = relations(vehicleMakes, ({ many }) => ({
  models: many(vehicleModels),
}));

export const vehicleModelsRelations = relations(vehicleModels, ({ one }) => ({
  make: one(vehicleMakes, {
    fields: [vehicleModels.makeId],
    references: [vehicleMakes.id],
  }),
}));
