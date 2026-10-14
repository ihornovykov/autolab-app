import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BanknoteIcon, CarIcon, UserRoundIcon, WrenchIcon } from "lucide-react";
import { useState } from "react";

import { orpc } from "@/shared/api/orpc";
import { PageHeader } from "@/shared/ui/admin-shell";
import { IconTile } from "@/shared/ui/icon-tile";
import { EditBookingButton } from "@/views/admin/organization-edit-forms";

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

const statusOptions = [
  { value: "PENDING", label: "Очікує" },
  { value: "IN_PROGRESS", label: "В роботі" },
  { value: "COMPLETED", label: "Виконано" },
  { value: "CANCELLED", label: "Скасовано" },
] as const;

type Status = (typeof statuses)[number];

type Props = { bookingId: string };

export const BookingDetailView = ({ bookingId }: Props) => {
  const queryClient = useQueryClient();
  const query = useQuery(orpc.admin.booking.getBooking.queryOptions({ input: { id: bookingId } }));
  const booking = query.data as
    | {
        id: string;
        status: Status;
        totalPrice: string;
        notes: string | null;
        organization: { id: string; name: string };
        vehicle: { make: string; model: string; licensePlate: string | null };
        employeeName: string;
        services: Array<{ title: string; quantity: number; unitPrice: string }>;
      }
    | undefined;
  const [status, setStatus] = useState<Status | null>(null);
  const [reason, setReason] = useState("");
  const selectedStatus = status ?? booking?.status ?? "PENDING";
  const mutation = useMutation(
    orpc.admin.booking.setBookingStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.admin.booking.key() });
      },
    }),
  );

  return (
    <div className="h-full min-h-0 overflow-auto">
      <PageHeader title="Запис" description={booking?.organization.name}>
        {booking ? (
          <EditBookingButton organizationId={booking.organization.id} bookingId={booking.id} appearance="button" />
        ) : null}
      </PageHeader>
      {query.isLoading ? <Skeleton className="h-48" /> : null}
      {booking ? (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IconTile icon={CarIcon} />
                {booking.vehicle.make} {booking.vehicle.model}
              </CardTitle>
              <Badge variant="secondary">{booking.vehicle.licensePlate ?? "без номера"}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <UserRoundIcon className="size-4 text-muted-foreground" />
                Майстер: {booking.employeeName}
              </p>
              <p className="flex items-center gap-2">
                <BanknoteIcon className="size-4 text-muted-foreground" />
                Сума: {booking.totalPrice} грн
              </p>
              {booking.notes ? <p className="text-muted-foreground">{booking.notes}</p> : null}
              <ul className="space-y-2">
                {booking.services.map((service) => (
                  <li key={service.title} className="flex items-center gap-2">
                    <WrenchIcon className="size-4 text-muted-foreground" />
                    {service.title} × {service.quantity} · {service.unitPrice} грн
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Виправити статус</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-1">
                <Label>Статус</Label>
                <Select
                  value={selectedStatus}
                  items={statusOptions.map((item) => ({ value: item.value, label: item.label }))}
                  onValueChange={(value) => {
                    if (value) setStatus(value as Status);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Причина"
                placeholder="Чому статус змінюється"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <Button
                type="button"
                isLoading={mutation.isPending}
                onClick={() => mutation.mutate({ id: booking.id, status: selectedStatus, reason })}
              >
                Зберегти
              </Button>
              {mutation.error ? <p className="text-sm text-destructive">{mutation.error.message}</p> : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
