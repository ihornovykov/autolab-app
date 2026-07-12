export type EmployeeRole = "TECHNICIAN" | "MANAGER" | "OWNER";

export const employeeRoleOptions: Array<{ value: EmployeeRole; label: string }> = [
  { value: "OWNER", label: "Власник" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "TECHNICIAN", label: "Працівник" },
];
