import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";

import { mapBookingToHistoryItem } from "@/features/calendar/lib/map-booking";
import { type CalendarEvent } from "@/features/calendar/lib/types";
import { DeleteVehicleBookingDialog } from "@/features/booking/ui/delete-vehicle-booking-dialog";
import { EditVehicleBookingSheet } from "@/features/booking/ui/edit-vehicle-booking-sheet";
import { BookingTimeDisplay } from "@/features/booking/ui/booking-time-display";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { formatPrice } from "@/shared/lib/format";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { RoleBadge } from "@/shared/ui/role-badge";
import { StatusLight } from "@/shared/ui/status-light";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";

type BookingPreview = Parameters<typeof mapBookingToHistoryItem>[0];

type Props = {
  booking: BookingPreview;
  organizationId: string;
  calendarEvent?: CalendarEvent;
};

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

export const BookingPreviewSheet = ({ booking, organizationId, calendarEvent }: Props) => {
  const navigate = useNavigate();
  const vehicle = booking.vehicle;
  const employee = booking.employee;
  const vehicleTitle = vehicle ? `${vehicle.make} ${vehicle.model}` : "Запис";

  const handleEdit = () => {
    sheets.close();
    sheets.open(
      <EditVehicleBookingSheet
        booking={mapBookingToHistoryItem(booking)}
        organizationId={organizationId}
      />,
    );
  };

  const handleDelete = () => {
    sheets.close();
    dialogs.open(
      <DeleteVehicleBookingDialog organizationId={organizationId} bookingId={booking.id} />,
    );
  };

  const handleOpenDetails = () => {
    sheets.close();
    navigate({
      to: "/dashboard/organization/bookings/$bookingId",
      params: { bookingId: booking.id },
      search: { organizationId },
    });
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      className="sm:max-w-md"
      contentClassName="space-y-5"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="destructive" icon={<Trash2Icon />} onClick={handleDelete}>
            Видалити
          </Button>
          <Button type="button" variant="outline" icon={<PencilIcon />} onClick={handleEdit}>
            Редагувати
          </Button>
        </div>
      }
    >
      <div className="relative -mx-6 -mt-5 border-b px-6 pb-4 pt-6 pr-12">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-12 top-5"
          icon={<ArrowUpRightIcon />}
          onClick={handleOpenDetails}
        >
          Деталі
        </Button>
        <div className="flex items-start gap-4">
          <VehicleMakeIcon make={vehicle?.make ?? ""} className="size-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {vehicle?.make ?? "Автомобіль"}
            </p>
            <h2 className="text-xl font-semibold leading-tight tracking-tight">{vehicleTitle}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusLight status={booking.status} />
              {vehicle?.year ? <Badge variant="secondary">{vehicle.year} рік</Badge> : null}
              {calendarEvent && calendarEvent.segmentCount > 1 ? (
                <Badge variant="outline" className="font-normal">
                  Сегмент {calendarEvent.segmentIndex + 1} з {calendarEvent.segmentCount}
                </Badge>
              ) : null}
            </div>
            {vehicle?.licensePlate ? (
              <div className="mt-3">
                <LicencePlate plateNumber={vehicle.licensePlate} />
              </div>
            ) : null}
          </div>
          <p className="shrink-0 text-lg font-bold tabular-nums">{formatPrice(booking.totalPrice)}</p>
        </div>
      </div>

      <section className="space-y-2">
        <SectionLabel>Час</SectionLabel>
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
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

      {employee ? (
        <section className="space-y-2">
          <SectionLabel>Майстер</SectionLabel>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <UserIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">{employee.name ?? "Працівник"}</p>
              <div className="mt-1">
                <RoleBadge role={employee.role} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {booking.services?.length ? (
        <section className="space-y-2">
          <SectionLabel>Послуги</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {booking.services.map((service) => (
              <Badge key={service.id} variant="outline" className="font-normal">
                {service.title}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {booking.notes ? (
        <section className="space-y-2">
          <SectionLabel>Примітки</SectionLabel>
          <p className="rounded-xl border border-border/60 px-4 py-3 text-sm whitespace-pre-wrap text-muted-foreground">
            {booking.notes}
          </p>
        </section>
      ) : null}
    </Sheet>
  );
};
