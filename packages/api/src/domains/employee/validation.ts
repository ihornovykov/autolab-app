import { z } from "zod";

import { employeeOutputSchema } from "@autolab/db/validation/employee";
import {
  workingHoursDayInputSchema,
  workingHoursOutputSchema,
} from "@autolab/db/validation/profile-working-hours";
import { userPublicSchema } from "@autolab/db/validation/auth";
import { createPaginatedOutputSchema, paginationInputSchema, searchInputSchema } from "../../lib/pagination";

export const organizationIdInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const getEmployeeWorkingHoursInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
});

export const getEmployeeWorkingHoursOutputSchema = z.array(workingHoursDayInputSchema);

export const employeeWithUserSchema = employeeOutputSchema.extend({
  user: userPublicSchema.extend({
    profile: z
      .object({
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        username: z.string().nullable(),
        phone: z.string().nullable(),
      })
      .nullable()
      .optional(),
  }),
});

export const listEmployeesInputSchema = organizationIdInputSchema.extend({
  page: paginationInputSchema.shape.page,
  pageSize: paginationInputSchema.shape.pageSize,
  search: searchInputSchema.shape.search,
  roles: z.array(z.enum(["TECHNICIAN", "MANAGER", "OWNER"])).optional(),
});

export const listEmployeesOutputSchema = createPaginatedOutputSchema(employeeWithUserSchema);
export type ListEmployeesOutput = z.infer<typeof listEmployeesOutputSchema>;

export const updateEmployeeInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  role: z.enum(["TECHNICIAN", "MANAGER", "OWNER"]).optional(),
  isActive: z.boolean().optional(),
});

export const updateEmployeeOutputSchema = employeeOutputSchema;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeInputSchema>;

export const deleteEmployeeInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
});

export const deleteManyEmployeesInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeIds: z.array(z.string().min(1)).min(1),
});

export const findEmployeeByEmailOrUsernameInputSchema = z.object({
  organizationId: z.string().min(1),
  query: z.string().min(1),
});

export const findEmployeeByEmailOrUsernameOutputSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
    profile: z
      .object({
        username: z.string().nullable(),
        phone: z.string().nullable(),
      })
      .nullable(),
  })
  .nullable();

export const inviteEmployeeInputSchema = z.object({
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["TECHNICIAN", "MANAGER", "OWNER"]).default("TECHNICIAN"),
});

export const inviteEmployeeOutputSchema = employeeOutputSchema;
