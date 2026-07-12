import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { type VehicleBookingHistoryItem } from "@/features/booking/lib/booking-history-item";
import { CreateVehicleBookingDialog } from "@/features/booking/ui/create-vehicle-booking-dialog";
import { EditVehicleBookingSheet } from "@/features/booking/ui/edit-vehicle-booking-sheet";
import { DeleteOrganizationVehicleDialog } from "@/features/vehicle/ui/delete-organization-vehicle-dialog";
import { EditOrganizationVehicleSheet } from "@/features/vehicle/ui/edit-organization-vehicle-sheet";
import {
  VehicleDetailSection,
  VehicleLicensePlateDisplay,
  VehicleServiceHistory,
  VehicleSpecsGrid,
  vehicleSpecIcons,
} from "@/features/vehicle/ui/vehicle-detail-sections";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { orpc } from "@/shared/api/orpc";
import { getClientName } from "@/shared/lib/format";
import { isQueryContentLoading } from "@/shared/lib/is-query-content-loading";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/pagination";
import { useSelectedOrganizationId } from "@/shared/lib/use-selected-organization-id";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { PageContainer } from "@/shared/ui/page-container";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";

const formatEngineVolume = (value: number) => {
  const formatted = Number(value.toFixed(1));
  return Number.isInteger(formatted) ? `${formatted}` : formatted.toFixed(1);
};

export const VehicleDetailView = () => {
  const { vehicleId } = useParams({ from: "/_auth/dashboard/vehicles/$vehicleId" });
  const organizationId = useSelectedOrganizationId();
  const navigate = useNavigate();
  const router = useRouter();
  const [bookingsPage, setBookingsPage] = useState(1);

  const vehicleQuery = useQuery({
    ...orpc.vehicle.getVehicleById.queryOptions({
      input: { organizationId: organizationId!, vehicleId },
    }),
    enabled: !!organizationId,
  });

  const bookingsQuery = useQuery({
    ...orpc.booking.listVehicleBookings.queryOptions({
      input: {
        organizationId: organizationId!,
        vehicleId,
        page: bookingsPage,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    }),
    enabled: !!organizationId,
  });

  if (!organizationId) return null;

  const vehicle = vehicleQuery.data;
  if (!vehicle) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Автомобіль не знайдено</p>
      </PageContainer>
    );
  }

  const handleEdit = () => {
    sheets.open(
      <EditOrganizationVehicleSheet
        vehicle={vehicle}
        organizationId={organizationId}
        onDeleted={() =>
          navigate({
            to: "/dashboard/organization/vehicles",
            search: { organizationId },
          })
        }
      />,
    );
  };

  const handleDelete = () => {
    dialogs.open(
      <DeleteOrganizationVehicleDialog
        organizationId={organizationId}
        vehicleId={vehicle.id}
        make={vehicle.make}
        model={vehicle.model}
        onDeleted={() =>
          navigate({
            to: "/dashboard/organization/vehicles",
            search: { organizationId },
          })
        }
      />,
    );
  };

  const handleCreateBooking = () => {
    dialogs.open(
      <CreateVehicleBookingDialog organizationId={organizationId} vehicleId={vehicle.id} />,
    );
  };

  const handleEditBooking = (booking: VehicleBookingHistoryItem) => {
    sheets.open(<EditVehicleBookingSheet booking={booking} organizationId={organizationId} />);
  };

  const specs = [
    { label: "Марка", value: vehicle.make },
    { label: "Модель", value: vehicle.model },
    { label: "Рік випуску", value: `${vehicle.year}`, icon: vehicleSpecIcons.calendar },
    { label: "VIN", value: vehicle.vin ?? "—" },
    { label: "Тип кузова", value: vehicle.bodyStyle ?? "—" },
    {
      label: "Двигун",
      value: vehicle.engine
        ? `${vehicle.engine}${vehicle.engineVolume ? ` (${formatEngineVolume(vehicle.engineVolume)} л)` : ""}`
        : "—",
      icon: vehicleSpecIcons.fuel,
    },
    {
      label: "Клієнт",
      value: vehicle.client ? getClientName(vehicle.client) : "—",
      icon: vehicleSpecIcons.user,
    },
  ];

  return (
    <PageContainer className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          icon={<ArrowLeftIcon />}
          onClick={() => router.history.back()}
        >
          Назад
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<PencilIcon />} onClick={handleEdit}>
            Редагувати
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <VehicleMakeIcon make={vehicle.make} className="size-16" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {vehicle.make}
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{vehicle.year} рік</Badge>
                {vehicle.bodyStyle ? <Badge variant="outline">{vehicle.bodyStyle}</Badge> : null}
              </div>
              {vehicle.client ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Клієнт:{" "}
                  <span className="font-medium text-foreground">
                    {getClientName(vehicle.client)}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
          <VehicleLicensePlateDisplay licensePlate={vehicle.licensePlate} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <VehicleDetailSection
            title="Характеристики"
            description="Технічні дані та прив'язка до клієнта"
          >
            <VehicleSpecsGrid items={specs} />
          </VehicleDetailSection>
        </div>

        <div className="xl:col-span-3">
          <VehicleDetailSection
            title="Історія записів"
            description="Обслуговування та ремонт цього автомобіля"
            action={
              <Button icon={<PlusIcon />} onClick={handleCreateBooking}>
                Додати запис
              </Button>
            }
          >
            <VehicleServiceHistory
              bookings={bookingsQuery.data?.items ?? []}
              isLoading={isQueryContentLoading(bookingsQuery)}
              onBookingClick={handleEditBooking}
            />
            <DataTablePagination
              page={bookingsPage}
              totalPages={bookingsQuery.data?.totalPages ?? 0}
              total={bookingsQuery.data?.total ?? 0}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setBookingsPage}
            />
          </VehicleDetailSection>
        </div>
      </div>
    </PageContainer>
  );
};
