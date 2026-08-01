import type { EmployeeRole } from "@/features/employee/lib/types";

export const employeeRoleOptions: Array<{ value: EmployeeRole; label: string }> = [
  { value: "OWNER", label: "Власник" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "TECHNICIAN", label: "Працівник" },
];
