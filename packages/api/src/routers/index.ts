import { adminRoutes } from "../domains/admin/routes";
import { bookingRoutes } from "../domains/booking/routes";
import { clientRoutes } from "../domains/client/routes";
import { employeeRoutes } from "../domains/employee/routes";
import { healthRoutes } from "../domains/health/routes";
import { organizationRoutes } from "../domains/organization/routes";
import { profileRoutes } from "../domains/profile/routes";
import { searchRoutes } from "../domains/search/routes";
import { serviceRoutes } from "../domains/service/routes";
import { userRoutes } from "../domains/user/routes";
import { vehicleRoutes } from "../domains/vehicle/routes";

export const appRouter = {
  health: healthRoutes,
  user: userRoutes,
  profile: profileRoutes,
  organization: organizationRoutes,
  employee: employeeRoutes,
  service: serviceRoutes,
  client: clientRoutes,
  vehicle: vehicleRoutes,
  booking: bookingRoutes,
  search: searchRoutes,
  admin: adminRoutes,
};

export type AppRouter = typeof appRouter;
