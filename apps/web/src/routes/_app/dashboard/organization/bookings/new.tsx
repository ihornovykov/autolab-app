import { createFileRoute } from "@tanstack/react-router";

import { SERVICES_SELECT_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import {
  prefetchOrganizationQuery,
} from "@/shared/lib/prefetch";
import { CreateBookingView } from "@/views/organization/create-booking-view";

export const Route = createFileRoute("/_app/dashboard/organization/bookings/new")({
  loader: ({ context }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.employee.listEmployees.queryOptions({
          input: { organizationId, page: 1, pageSize: 100 },
        }),
      );
      void context.queryClient.prefetchQuery(
        orpc.service.listServices.queryOptions({
          input: { organizationId, page: 1, pageSize: SERVICES_SELECT_PAGE_SIZE },
        }),
      );
    });
  },
  component: CreateBookingView,
});
