import { CalendarIcon, UserIcon } from "lucide-react";

import { BookingDiscountDisplay } from "@/features/booking/ui/booking-discount-display";
import { BookingTimeDisplay } from "@/features/booking/ui/booking-time-display";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { VehicleCard } from "@/features/vehicle/ui/vehicle-card";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { formatPrice } from "@/shared/lib/money";
import { RoleBadge } from "@/shared/ui/role-badge";
import { Badge } from "@autolab/ui/components/badge";

export type BookingDetailService = {
  id?: string;
  title: string;
  description?: string | null;
  price: string;
  quantity?: number;
  unitPrice?: string;
};

export type BookingDetailVehicle = {
  id?: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
};

export type BookingDetailEmployee = {
  name?: string | null;
  role?: "TECHNICIAN" | "MANAGER" | "OWNER";
};

type BookingTimeDisplayBooking = Parameters<typeof BookingTimeDisplay>[0]["booking"];

export type BookingDetailContentBooking = {
  id?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startTime: Date | string;
  endTime: Date | string;
  allowsOvertime: boolean;
  notes?: string | null;
  totalPrice: string;
  services?: BookingDetailService[];
  employee?: BookingDetailEmployee | null;
  employeeWorkingHours?: BookingTimeDisplayBooking["employeeWorkingHours"];
};

type Props = {
  booking: BookingDetailContentBooking;
  vehicle?: BookingDetailVehicle | null;
  clientName?: string | null;
  onVehicleClick?: () => void;
  hideTime?: boolean;
  showTotalAtBottom?: boolean;
};

export const BookingDetailContent = ({
  booking,
  vehicle,
  clientName,
  onVehicleClick,
  hideTime = false,
  showTotalAtBottom = false,
}: Props) => {
  const employee = booking.employee;

  return (
    <>
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
              {vehicle?.year ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{vehicle.year} рік</Badge>
                </div>
              ) : null}
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
        {hideTime ? null : (
          <section className="rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight">Час</h2>
              <p className="mt-1 text-sm text-muted-foreground">Запланований період обслуговування</p>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-2">
                <CalendarIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <BookingTimeDisplay
                  booking={{
                    id: booking.id ?? "share",
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    allowsOvertime: booking.allowsOvertime,
                    employeeWorkingHours: booking.employeeWorkingHours,
                  }}
                />
              </div>
              {booking.allowsOvertime ? (
                <Badge variant="outline" className="mt-3 font-normal">
                  Дозволено понаднормове обслуговування
                </Badge>
              ) : null}
            </div>
          </section>
        )}

        <section
          className={
            hideTime
              ? "rounded-xl border border-border/70 bg-card shadow-sm xl:col-span-2"
              : "rounded-xl border border-border/70 bg-card shadow-sm"
          }
        >
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
                  {employee.role ? (
                    <div className="mt-1">
                      <RoleBadge role={employee.role} />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Працівника не знайдено</p>
            )}
          </div>
        </section>

        {clientName ? (
          <section className="rounded-xl border border-border/70 bg-card shadow-sm xl:col-span-2">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight">Клієнт</h2>
            </div>
            <div className="p-5">
              <p className="font-medium">{clientName}</p>
            </div>
          </section>
        ) : null}

        <section className="rounded-xl border border-border/70 bg-card shadow-sm xl:col-span-2">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Послуги</h2>
            <p className="mt-1 text-sm text-muted-foreground">Обрані роботи для цього запису</p>
          </div>
          <div className="p-5">
            {booking.services?.length ? (
              <div className="space-y-3">
                {booking.services.map((service, index) => {
                  const quantity = service.quantity ?? 1;
                  const unitPrice = service.unitPrice ?? service.price;
                  const lineTotal = Number(unitPrice) * quantity;

                  return (
                    <div
                      key={service.id ?? `${service.title}-${index}`}
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
            {showTotalAtBottom ? (
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border/60 pt-4">
                <p className="text-base font-semibold tracking-tight">Сума</p>
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
            ) : null}
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
              <VehicleCard
                vehicle={{ ...vehicle, id: vehicle.id ?? "" }}
                onClick={onVehicleClick}
              />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
};
