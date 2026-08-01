import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/prefetch";
import { EmployeesView } from "@/views/organization/employees-view";

export const Route = createFileRoute("/_auth/dashboard/organization/employees")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.employee.listEmployees.queryOptions({ input: defaultListInput(organizationId) }),
      );
    });
  },
  component: EmployeesView,
});
