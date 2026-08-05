import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PencilIcon, PhoneIcon } from "lucide-react";

import { BookingListCard, BookingListCardSkeleton } from "@/features/booking/ui/booking-list-card";
import { EditClientSheet } from "@/features/client/ui/edit-client-sheet";
import { VehicleCard, VehicleCardSkeleton } from "@/features/vehicle/ui/vehicle-card";
import { orpc } from "@/shared/api/orpc";
import { range } from "@/shared/lib/arrays";
import { getClientDisplayName } from "@/shared/lib/client";
import { sheets } from "@/shared/stores/sheets";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";
import { Skeleton } from "@autolab/ui/components/skeleton";

type ClientPreview = {
  id: string;
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  email?: string | null;
};

type Props = {
  client: ClientPreview;
  organizationId: string;
};

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

export const ClientDetailSheet = ({ client, organizationId }: Props) => {
  const navigate = useNavigate();
  const detailsQuery = useQuery({
    ...orpc.client.getClientDetails.queryOptions({
      input: { organizationId, clientId: client.id },
    }),
  });

  const handleEdit = () => {
    const clientData = detailsQuery.data?.client ?? client;
    sheets.close();
    sheets.open(<EditClientSheet client={clientData} organizationId={organizationId} />);
  };

  const vehicles = detailsQuery.data?.vehicles ?? [];
  const bookings = detailsQuery.data?.bookings ?? [];

  const handleVehicleClick = (vehicleId: string) => {
    sheets.close();
    navigate({
      to: "/dashboard/vehicles/$vehicleId",
      params: { vehicleId },
    });
  };

  const handleBookingClick = (bookingId: string) => {
    sheets.close();
    navigate({
      to: "/dashboard/organization/bookings/$bookingId",
      params: { bookingId },
    });
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      className="sm:max-w-md"
      contentClassName="space-y-6"
    >
      <div className="-mx-6 -mt-5 border-b px-6 pb-4 pt-6 pr-12">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Редагувати клієнта"
          className="absolute right-12 top-5"
          onClick={handleEdit}
        >
          <PencilIcon className="size-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-tight tracking-tight">
            {getClientDisplayName(client)}
          </h2>
          {client.phone ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <PhoneIcon className="size-3.5 shrink-0" />
              <span className="font-mono tabular-nums">{client.phone}</span>
            </p>
          ) : null}
        </div>
      </div>

      {detailsQuery.isLoading ? (
        <ClientDetailSheetSkeleton />
      ) : (
        <>
          <section className="space-y-3">
            <SectionLabel>Автомобілі</SectionLabel>
            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onClick={() => handleVehicleClick(vehicle.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                Автомобілів немає
              </p>
            )}
          </section>

          <section className="space-y-3">
            <SectionLabel>Історія записів</SectionLabel>
            {bookings.length > 0 ? (
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <BookingListCard
                    key={booking.id}
                    booking={booking}
                    onClick={() => handleBookingClick(booking.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
                Записів немає
              </p>
            )}
          </section>
        </>
      )}
    </Sheet>
  );
};

const ClientDetailSheetSkeleton = () => (
  <div className="space-y-6">
    <section className="space-y-3">
      <Skeleton className="h-3 w-20" />
      <div className="grid grid-cols-1 gap-3">
        {range(2).map((index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    </section>
    <section className="space-y-3">
      <Skeleton className="h-3 w-16" />
      <div className="space-y-2">
        {range(2).map((index) => (
          <BookingListCardSkeleton key={index} />
        ))}
      </div>
    </section>
  </div>
);
