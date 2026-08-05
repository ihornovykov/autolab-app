import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";

import { employeesFilterParams } from "@/features/employee/hooks/use-employees-filters";
import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  prefetchOrganizationQuery,
} from "@/shared/lib/prefetch";
import { EmployeesView } from "@/views/organization/employees-view";

export const Route = createFileRoute("/_app/dashboard/organization/employees")({
  validateSearch: createStandardSchemaV1(employeesFilterParams, { partialOutput: true }),
  loader: ({ context }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.employee.listEmployees.queryOptions({ input: defaultListInput(organizationId) }),
      );
    });
  },
  component: EmployeesView,
});
