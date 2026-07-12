import { pgEnum } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE"]);

export const employeeRoleEnum = pgEnum("employee_role", ["TECHNICIAN", "MANAGER", "OWNER"]);

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "CAR",
  "MOTORCYCLE",
  "TRUCK",
  "VAN",
  "BUS",
  "OTHER",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
