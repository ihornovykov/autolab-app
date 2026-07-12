import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { EmployeesView } from "@/views/organization/employees-view";

export const Route = createFileRoute("/_auth/dashboard/organization/employees")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.employee.listEmployees.queryOptions({ input: defaultListInput(organizationId) }),
      ),
    );
  },
  component: EmployeesView,
});
