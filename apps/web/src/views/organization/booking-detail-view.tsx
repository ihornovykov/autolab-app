import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, CalendarIcon, PencilIcon, Trash2Icon, UserIcon } from "lucide-react";

import { mapBookingToHistoryItem } from "@/features/calendar/lib/map-booking";
import { BookingDiscountDisplay } from "@/features/booking/ui/booking-discount-display";
import { DeleteVehicleBookingDialog } from "@/features/booking/ui/delete-vehicle-booking-dialog";
import { EditVehicleBookingSheet } from "@/features/booking/ui/edit-vehicle-booking-sheet";
import { BookingTimeDisplay } from "@/features/booking/ui/booking-time-display";
import { PrintBookingReceiptButton } from "@/features/booking/ui/print-booking-receipt-button";
import { VehicleCard } from "@/features/vehicle/ui/vehicle-card";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { orpc } from "@/shared/api/orpc";
import { formatPrice } from "@/shared/lib/format";
import { useSelectedOrganizationId } from "@/shared/lib/use-selected-organization-id";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { PageContainer } from "@/shared/ui/page-container";
import { RoleBadge } from "@/shared/ui/role-badge";
import { StatusLight } from "@/shared/ui/status-light";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";

export const BookingDetailView = () => {
  const { bookingId } = useParams({
    from: "/_auth/dashboard/organization/bookings/$bookingId",
  });
  const organizationId = useSelectedOrganizationId();
  const navigate = useNavigate();
  const router = useRouter();

  const bookingQuery = useQuery({
    ...orpc.booking.getBookingById.queryOptions({
      input: { organizationId: organizationId!, bookingId },
    }),
    enabled: !!organizationId,
  });

  const booking = bookingQuery.data;

  const vehicleQuery = useQuery({
    ...orpc.vehicle.getVehicleById.queryOptions({
      input: {
        organizationId: organizationId!,
        vehicleId: booking?.vehicleId ?? "",
      },
    }),
    enabled: !!organizationId && !!booking?.vehicleId,
  });

  if (!organizationId) return null;

  if (!booking) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Запис не знайдено</p>
      </PageContainer>
    );
  }

  const employee = booking.employee;
  const vehicle = vehicleQuery.data ?? booking.vehicle;

  const handleEdit = () => {
    sheets.open(
      <EditVehicleBookingSheet
        booking={mapBookingToHistoryItem(booking)}
        organizationId={organizationId}
      />,
    );
  };

  const handleDelete = () => {
    dialogs.open(
      <DeleteVehicleBookingDialog
        organizationId={organizationId}
        bookingId={booking.id}
        onDeleted={() =>
          navigate({
            to: "/dashboard/organization/bookings",
            search: { organizationId },
          })
        }
      />,
    );
  };

  const handleVehicleClick = () => {
    if (!vehicle?.id) return;
    navigate({
      to: "/dashboard/vehicles/$vehicleId",
      params: { vehicleId: vehicle.id },
      search: { organizationId },
    });
  };

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
          <PrintBookingReceiptButton organizationId={organizationId} bookingId={booking.id} />
          <Button variant="outline" icon={<PencilIcon />} onClick={handleEdit}>
            Редагувати
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <VehicleMakeIcon make={vehicle?.make ?? ""} className="size-16" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {vehicle?.make ?? "Автомобіль"}
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                {vehicle ? `${vehicle.make} ${vehicle.model}` : "Запис"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {vehicle?.year ? <Badge variant="secondary">{vehicle.year} рік</Badge> : null}
                <StatusLight status={booking.status} />
              </div>
              {vehicle?.licensePlate ? (
                <div className="mt-3">
                  <LicencePlate plateNumber={vehicle.licensePlate} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <BookingDiscountDisplay
              services={booking.services ?? []}
              totalPrice={booking.totalPrice}
              showSubtotal
              className="mb-1"
            />
            <p className="text-2xl font-bold tabular-nums">{formatPrice(booking.totalPrice)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Час</h2>
            <p className="mt-1 text-sm text-muted-foreground">Запланований період обслуговування</p>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-2">
              <CalendarIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <BookingTimeDisplay booking={booking} />
            </div>
            {booking.allowsOvertime ? (
              <Badge variant="outline" className="mt-3 font-normal">
                Дозволено понаднормове обслуговування
              </Badge>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Майстер</h2>
            <p className="mt-1 text-sm text-muted-foreground">Відповідальний працівник</p>
          </div>
          <div className="p-5">
            {employee ? (
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{employee.name ?? "Працівник"}</p>
                  <div className="mt-1">
                    <RoleBadge role={employee.role} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Працівника не знайдено</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-border/70 bg-card shadow-sm xl:col-span-2">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Послуги</h2>
            <p className="mt-1 text-sm text-muted-foreground">Обрані роботи для цього запису</p>
          </div>
          <div className="p-5">
            {booking.services?.length ? (
              <div className="space-y-3">
                {booking.services.map((service) => {
                  const quantity = service.quantity ?? 1;
                  const unitPrice = service.unitPrice ?? service.price;
                  const lineTotal = Number(unitPrice) * quantity;

                  return (
                  <div
                    key={service.id}
                    className="rounded-lg border border-border/60 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{service.title}</p>
                        {quantity > 1 ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatPrice(unitPrice)} × {quantity}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>
                    {service.description ? (
                      <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                        {service.description}
                      </p>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Послуги не вказані</p>
            )}
          </div>
        </section>

        {booking.notes ? (
          <section className="rounded-xl border border-border/70 bg-card shadow-sm xl:col-span-2">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight">Примітки</h2>
            </div>
            <div className="p-5">
              <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
            </div>
          </section>
        ) : null}

        {vehicle ? (
          <section className="xl:col-span-2">
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Автомобіль</h2>
              <p className="mt-1 text-sm text-muted-foreground">Картка авто для цього запису</p>
            </div>
            <div className="max-w-sm">
              <VehicleCard vehicle={vehicle} onClick={handleVehicleClick} />
            </div>
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
};
