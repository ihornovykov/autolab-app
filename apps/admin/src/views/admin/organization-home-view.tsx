import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CalendarIcon,
  CarIcon,
  ClockIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserRoundIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { IconTile } from "@/shared/ui/icon-tile";

type Props = { organizationId: string };

const weekdayLabels: Record<number, string> = {
  1: "Понеділок",
  2: "Вівторок",
  3: "Середа",
  4: "Четвер",
  5: "П'ятниця",
  6: "Субота",
  7: "Неділя",
};

const sections = [
  { key: "employees", label: "Працівники", to: "/organizations/$organizationId/employees", icon: UsersIcon },
  { key: "bookings", label: "Записи", to: "/organizations/$organizationId/bookings", icon: CalendarIcon },
  { key: "vehicles", label: "Авто", to: "/organizations/$organizationId/vehicles", icon: CarIcon },
  { key: "clients", label: "Клієнти", to: "/organizations/$organizationId/clients", icon: UserRoundIcon },
  { key: "services", label: "Послуги", to: "/organizations/$organizationId/services", icon: WrenchIcon },
] as const;

const statusLabel = {
  PENDING: "Очікує",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
} as const;

export const OrganizationHomeView = ({ organizationId }: Props) => {
  const query = useQuery(
    orpc.admin.organization.getOrganization.queryOptions({ input: { id: organizationId } }),
  );
  const organization = query.data as
    | {
        logo: string | null;
        description: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        counts: { employees: number; clients: number; services: number; vehicles: number; bookings: number };
        workingHours: Array<{ weekday: number; openTime: string | null; closeTime: string | null; isClosed: boolean }>;
        recentBookings: Array<{
          id: string;
          status: keyof typeof statusLabel;
          startTime: string;
          totalPrice: string;
          vehicle: string | null;
        }>;
      }
    | undefined;

  if (query.isLoading) return <Skeleton className="h-40" />;
  if (!organization) return null;

  const hours = [...organization.workingHours].sort((left, right) => left.weekday - right.weekday);

  return (
    <div className="grid min-h-0 content-start gap-4 overflow-auto pb-2 lg:grid-cols-[280px_1fr]">
      <div className="grid content-start gap-4">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <IconTile icon={MapPinIcon} />
            <CardTitle>Контакти</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {organization.logo ? (
              <img src={organization.logo} alt="" className="size-16 rounded-lg object-cover" />
            ) : null}
            <ContactRow icon={MapPinIcon} value={organization.address ?? "Адресу не вказано"} />
            <ContactRow icon={PhoneIcon} value={organization.phone ?? "Телефон не вказано"} />
            <ContactRow icon={MailIcon} value={organization.email ?? "Email не вказано"} />
            {organization.website ? <ContactRow icon={GlobeIcon} value={organization.website} /> : null}
            {organization.description ? <p className="text-muted-foreground">{organization.description}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <IconTile icon={ClockIcon} />
            <CardTitle>Години роботи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {hours.length === 0 ? <p className="text-muted-foreground">Графік не заповнено</p> : null}
            {hours.map((day) => (
              <div key={day.weekday} className="flex items-center justify-between gap-3">
                <span>{weekdayLabels[day.weekday] ?? `День ${day.weekday}`}</span>
                <span className="text-muted-foreground">
                  {day.isClosed ? "Вихідний" : `${day.openTime ?? "—"}–${day.closeTime ?? "—"}`}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid content-start gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.key} to={section.to} params={{ organizationId }}>
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <IconTile icon={section.icon} />
                  <div>
                    <div className="text-xs text-muted-foreground">{section.label}</div>
                    <div className="text-2xl font-semibold">{organization.counts[section.key]}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <IconTile icon={CalendarIcon} />
            <CardTitle>Останні записи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {organization.recentBookings.length === 0 ? (
              <p className="text-muted-foreground">Записів ще немає</p>
            ) : (
              organization.recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to="/bookings/$bookingId"
                  params={{ bookingId: booking.id }}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <IconTile icon={CarIcon} />
                  <span className="min-w-0 flex-1">
                    {new Date(booking.startTime).toLocaleString("uk-UA")}
                    <span className="block truncate text-muted-foreground">{booking.vehicle ?? "без авто"}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {statusLabel[booking.status]} · {booking.totalPrice} грн
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ContactRow = ({ icon: Icon, value }: { icon: typeof MapPinIcon; value: string }) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    <span>{value}</span>
  </div>
);
