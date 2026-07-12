import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { employees } from "../schema/employee";

export const employeeSelectSchema = createSelectSchema(employees);
export const employeeInsertSchema = createInsertSchema(employees);

export const employeeOutputSchema = employeeSelectSchema;
export type EmployeeOutput = z.infer<typeof employeeOutputSchema>;
