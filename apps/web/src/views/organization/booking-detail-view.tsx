import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { mapBookingToHistoryItem } from "@/features/calendar/lib/utils";
import { BookingDetailContent } from "@/features/booking/ui/booking-detail-content";
import { BookingDetailSkeleton } from "@/features/booking/ui/booking-detail-skeleton";
import { CopyBookingLinkButton } from "@/features/booking/ui/copy-booking-link-button";
import { DeleteVehicleBookingDialog } from "@/features/booking/ui/delete-vehicle-booking-dialog";
import { EditVehicleBookingSheet } from "@/features/booking/ui/edit-vehicle-booking-sheet";
import { PrintBookingReceiptButton } from "@/features/booking/ui/print-booking-receipt-button";
import { orpc } from "@/shared/api/orpc";
import { isQueryContentLoading } from "@/shared/lib/query";
import { useOrganizationContext } from "@/shared/hooks/use-organization";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { PageContainer } from "@/shared/ui/page-container";
import { Button } from "@autolab/ui/components/button";

export const BookingDetailView = () => {
  const { bookingId } = useParams({
    from: "/_app/dashboard/organization/bookings/$bookingId",
  });
  const { organizationId, isOrganizationLoading } = useOrganizationContext();
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

  if (isOrganizationLoading || isQueryContentLoading(bookingQuery)) {
    return (
      <PageContainer>
        <BookingDetailSkeleton />
      </PageContainer>
    );
  }

  if (!organizationId) return null;

  if (!booking) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Запис не знайдено</p>
      </PageContainer>
    );
  }

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
        onDeleted={() => navigate({ to: "/dashboard/organization/bookings" })}
      />,
    );
  };

  const handleVehicleClick = () => {
    if (!vehicle?.id) return;
    navigate({
      to: "/dashboard/vehicles/$vehicleId",
      params: { vehicleId: vehicle.id },
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CopyBookingLinkButton organizationId={organizationId} bookingId={booking.id} />
          <PrintBookingReceiptButton organizationId={organizationId} bookingId={booking.id} />
          <Button
            variant="outline"
            size="icon-sm"
            className="sm:h-9 sm:w-auto sm:px-4"
            icon={<PencilIcon />}
            aria-label="Редагувати"
            onClick={handleEdit}
          >
            <span className="hidden sm:inline">Редагувати</span>
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            className="sm:size-9"
            aria-label="Видалити"
            onClick={handleDelete}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <BookingDetailContent
        booking={booking}
        vehicle={vehicle}
        onVehicleClick={vehicle?.id ? handleVehicleClick : undefined}
      />
    </PageContainer>
  );
};
