import type { EmployeeRole } from "@/features/employee/lib/types";

type Employee = {
  role: EmployeeRole;
  user: {
    name: string;
    email: string;
  };
};

export const filterEmployees = <T extends Employee>(
  employees: T[],
  search: string,
  roles: EmployeeRole[],
) => {
  const query = search.trim().toLowerCase();

  return employees.filter((employee) => {
    const matchesSearch = query
      ? employee.user.name.toLowerCase().includes(query) ||
        employee.user.email.toLowerCase().includes(query)
      : true;

    const matchesRole = roles.length > 0 ? roles.includes(employee.role) : true;

    return matchesSearch && matchesRole;
  });
};
