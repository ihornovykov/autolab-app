export type DashboardBreadcrumbItem = {
  label: string;
  to?: string;
};

type DynamicBreadcrumbLabels = {
  booking?: string;
  vehicle?: string;
};

const overviewCrumb = {
  label: "Організація",
  to: "/dashboard",
} satisfies DashboardBreadcrumbItem;

const organizationPages: Record<string, Omit<DashboardBreadcrumbItem, "to"> & { to: string }> = {
  "/dashboard/organization/employees": {
    label: "Працівники",
    to: "/dashboard/organization/employees",
  },
  "/dashboard/organization/clients": {
    label: "Клієнти",
    to: "/dashboard/organization/clients",
  },
  "/dashboard/organization/services": {
    label: "Послуги",
    to: "/dashboard/organization/services",
  },
  "/dashboard/organization/vehicles": {
    label: "Авто",
    to: "/dashboard/organization/vehicles",
  },
  "/dashboard/organization/bookings": {
    label: "Записи",
    to: "/dashboard/organization/bookings",
  },
  "/dashboard/organization/calendar": {
    label: "Календар",
    to: "/dashboard/organization/calendar",
  },
};

const normalizePathname = (pathname: string) => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

export const buildDashboardBreadcrumbs = (
  pathname: string,
  dynamicLabels: DynamicBreadcrumbLabels = {},
): DashboardBreadcrumbItem[] => {
  const path = normalizePathname(pathname);

  if (path === "/dashboard") {
    return [{ label: overviewCrumb.label }];
  }

  if (path === "/dashboard/account/settings") {
    return [overviewCrumb, { label: "Налаштування" }];
  }

  const organizationPage = organizationPages[path];
  if (organizationPage) {
    return [overviewCrumb, organizationPage];
  }

  if (path === "/dashboard/organization/bookings/new") {
    return [
      overviewCrumb,
      organizationPages["/dashboard/organization/bookings"],
      { label: "Створити запис" },
    ];
  }

  if (/^\/dashboard\/organization\/bookings\/[^/]+$/.test(path)) {
    return [
      overviewCrumb,
      organizationPages["/dashboard/organization/bookings"],
      { label: dynamicLabels.booking ?? "Запис" },
    ];
  }

  if (/^\/dashboard\/vehicles\/[^/]+$/.test(path)) {
    return [
      overviewCrumb,
      organizationPages["/dashboard/organization/vehicles"],
      { label: dynamicLabels.vehicle ?? "Автомобіль" },
    ];
  }

  return [{ label: overviewCrumb.label }];
};

export const formatVehicleBreadcrumbLabel = (vehicle: {
  make: string;
  model: string;
  licensePlate?: string | null;
}) => {
  const title = `${vehicle.make} ${vehicle.model}`.trim();
  return vehicle.licensePlate?.trim() ? `${title} (${vehicle.licensePlate.trim()})` : title;
};

export const formatBookingBreadcrumbLabel = (booking: {
  startTime: Date | string;
  vehicle?: {
    make?: string | null;
    model?: string | null;
    licensePlate?: string | null;
  } | null;
}) => {
  if (booking.vehicle?.make && booking.vehicle.model) {
    return formatVehicleBreadcrumbLabel({
      make: booking.vehicle.make,
      model: booking.vehicle.model,
      licensePlate: booking.vehicle.licensePlate,
    });
  }

  if (booking.vehicle?.licensePlate?.trim()) {
    return booking.vehicle.licensePlate.trim();
  }

  return "Запис";
};
