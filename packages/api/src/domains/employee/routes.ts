import { z } from "zod";

import { orgProcedure } from "../..";

import {
  deleteEmployee,
  deleteManyEmployees,
  findEmployeeByEmailOrUsername,
  getEmployeeWorkingHours,
  inviteEmployee,
  listEmployees,
  updateEmployee,
} from "./services";
import {
  deleteEmployeeInputSchema,
  deleteManyEmployeesInputSchema,
  findEmployeeByEmailOrUsernameInputSchema,
  findEmployeeByEmailOrUsernameOutputSchema,
  getEmployeeWorkingHoursInputSchema,
  getEmployeeWorkingHoursOutputSchema,
  inviteEmployeeInputSchema,
  inviteEmployeeOutputSchema,
  listEmployeesInputSchema,
  listEmployeesOutputSchema,
  updateEmployeeInputSchema,
  updateEmployeeOutputSchema,
} from "./validation";

const successSchema = z.object({ success: z.literal(true) });

export const employeeRoutes = {
  listEmployees: orgProcedure
    .input(listEmployeesInputSchema)
    .output(listEmployeesOutputSchema)
    .handler(async ({ context, input }) => listEmployees(context, input)),

  getEmployeeWorkingHours: orgProcedure
    .input(getEmployeeWorkingHoursInputSchema)
    .output(getEmployeeWorkingHoursOutputSchema)
    .handler(async ({ context, input }) => getEmployeeWorkingHours(context, input)),

  updateEmployee: orgProcedure
    .input(updateEmployeeInputSchema)
    .output(updateEmployeeOutputSchema)
    .handler(async ({ context, input }) => updateEmployee(context, input)),

  deleteEmployee: orgProcedure
    .input(deleteEmployeeInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteEmployee(context, input)),

  deleteManyEmployees: orgProcedure
    .input(deleteManyEmployeesInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteManyEmployees(context, input)),

  findEmployeeByEmailOrUsername: orgProcedure
    .input(findEmployeeByEmailOrUsernameInputSchema)
    .output(findEmployeeByEmailOrUsernameOutputSchema)
    .handler(async ({ context, input }) => findEmployeeByEmailOrUsername(context, input)),

  inviteEmployee: orgProcedure
    .input(inviteEmployeeInputSchema)
    .output(inviteEmployeeOutputSchema)
    .handler(async ({ context, input }) => inviteEmployee(context, input)),
};
