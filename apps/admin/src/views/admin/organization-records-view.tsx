import { Badge } from "@autolab/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, CarIcon, UserRoundIcon, UsersIcon, WrenchIcon } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { useTableState } from "@/shared/hooks/use-table-state";
import { NameCell, PAGE_SIZE, TableFrame } from "@/shared/ui/admin-table";
import {
  EditBookingButton,
  EditClientButton,
  EditServiceButton,
  EditVehicleButton,
  RecordActions,
  type ClientRecord,
  type ServiceRecord,
  type VehicleRecord,
} from "@/views/admin/organization-edit-forms";
import {
  CreateBookingButton,
  CreateClientButton,
  CreateEmployeeButton,
  CreateServiceButton,
  CreateVehicleButton,
  DeleteEntityButton,
  employeeRoles,
  OptionSelect,
} from "@/views/admin/organization-forms";

type Section = "employees" | "clients" | "vehicles" | "services" | "bookings";

type Props = { organizationId: string; section: Section };

const statusVariant = {
  PENDING: "yellow",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "secondary",
} as const;

const statusLabel = {
  PENDING: "Очікує",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
} as const;

export const OrganizationRecordsView = ({ organizationId, section }: Props) => {
  if (section === "employees") return <Employees organizationId={organizationId} />;
  if (section === "clients") return <Clients organizationId={organizationId} />;
  if (section === "vehicles") return <Vehicles organizationId={organizationId} />;
  if (section === "services") return <Services organizationId={organizationId} />;
  return <Bookings organizationId={organizationId} />;
};

const Employees = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const query = useQuery(
    orpc.admin.organization.listEmployees.queryOptions({
      input: scope(organizationId, table.search, table.page),
    }),
  );
  const updateRole = useMutation(
    orpc.admin.organization.updateEmployee.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() }),
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    orpc.admin.organization.deleteEmployee.mutationOptions({
      onSuccess: () => {
        toast.success("Працівника видалено");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const data = query.data as
    | {
        items: Array<{ id: string; userId: string; name: string; email: string; role: string; isActive: boolean }>;
        total: number;
        totalPages: number;
      }
    | undefined;

  return (
    <Frame
      table={table}
      placeholder="Імʼя або email"
      data={data}
      isLoading={query.isLoading}
      toolbar={<CreateEmployeeButton organizationId={organizationId} />}
    >
      <Table>
        <Head cells={["Імʼя", "Email", "Роль", "Статус", ""]} />
        <TableBody>
          <Empty count={data?.items.length} span={5} />
          {data?.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <NameCell icon={UsersIcon}>
                  <Link to="/users/$userId" params={{ userId: item.userId }} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                </NameCell>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.email}</TableCell>
              <TableCell>
                <OptionSelect
                  value={item.role}
                  ariaLabel="Роль"
                  className="h-8"
                  options={employeeRoles}
                  onValueChange={(role) =>
                    updateRole.mutate({
                      organizationId,
                      employeeId: item.id,
                      role: role as (typeof employeeRoles)[number]["value"],
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  aria-label={item.isActive ? "Зробити неактивним" : "Зробити активним"}
                  onClick={() =>
                    updateRole.mutate({
                      organizationId,
                      employeeId: item.id,
                      isActive: !item.isActive,
                    })
                  }
                >
                  <Badge variant={item.isActive ? "green" : "secondary"}>
                    {item.isActive ? "Активний" : "Неактивний"}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-right">
                <DeleteEntityButton
                  title="Видалити працівника"
                  onDelete={() => remove.mutateAsync({ organizationId, employeeId: item.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
  );
};

const Clients = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const query = useQuery(
    orpc.admin.organization.listClients.queryOptions({
      input: scope(organizationId, table.search, table.page),
    }),
  );
  const remove = useMutation(
    orpc.admin.organization.deleteClient.mutationOptions({
      onSuccess: () => {
        toast.success("Клієнта видалено");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const data = query.data as
    | { items: Array<ClientRecord & { name: string }>; total: number; totalPages: number }
    | undefined;

  return (
    <Frame
      table={table}
      placeholder="Імʼя або телефон"
      data={data}
      isLoading={query.isLoading}
      toolbar={<CreateClientButton organizationId={organizationId} />}
    >
      <Table>
        <Head cells={["Імʼя", "Телефон", ""]} />
        <TableBody>
          <Empty count={data?.items.length} span={3} />
          {data?.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <NameCell icon={UserRoundIcon}>
                  <span className="font-medium">{item.name}</span>
                </NameCell>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.phone ?? "—"}</TableCell>
              <TableCell className="text-right">
                <RecordActions>
                  <EditClientButton organizationId={organizationId} client={item} />
                  <DeleteEntityButton
                    title="Видалити клієнта"
                    onDelete={() => remove.mutateAsync({ organizationId, clientId: item.id })}
                  />
                </RecordActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
  );
};

const Vehicles = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const query = useQuery(
    orpc.admin.organization.listVehicles.queryOptions({
      input: scope(organizationId, table.search, table.page),
    }),
  );
  const remove = useMutation(
    orpc.admin.organization.deleteVehicle.mutationOptions({
      onSuccess: () => {
        toast.success("Авто видалено");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const data = query.data as
    | {
        items: Array<VehicleRecord & { name: string; clientName: string }>;
        total: number;
        totalPages: number;
      }
    | undefined;

  return (
    <Frame
      table={table}
      placeholder="Марка, модель або номер"
      data={data}
      isLoading={query.isLoading}
      toolbar={<CreateVehicleButton organizationId={organizationId} />}
    >
      <Table>
        <Head cells={["Авто", "Рік", "Номер", "Клієнт", ""]} />
        <TableBody>
          <Empty count={data?.items.length} span={5} />
          {data?.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <NameCell icon={CarIcon}>
                  <span className="font-medium">{item.name}</span>
                </NameCell>
              </TableCell>
              <TableCell>{item.year}</TableCell>
              <TableCell>{item.licensePlate ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{item.clientName}</TableCell>
              <TableCell className="text-right">
                <RecordActions>
                  <EditVehicleButton organizationId={organizationId} vehicle={item} />
                  <DeleteEntityButton
                    title="Видалити авто"
                    onDelete={() => remove.mutateAsync({ organizationId, vehicleId: item.id })}
                  />
                </RecordActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
  );
};

const Services = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const query = useQuery(
    orpc.admin.organization.listServices.queryOptions({
      input: scope(organizationId, table.search, table.page),
    }),
  );
  const remove = useMutation(
    orpc.admin.organization.deleteService.mutationOptions({
      onSuccess: () => {
        toast.success("Послугу видалено");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const data = query.data as
    | {
        items: Array<ServiceRecord>;
        total: number;
        totalPages: number;
      }
    | undefined;

  return (
    <Frame
      table={table}
      placeholder="Назва або категорія"
      data={data}
      isLoading={query.isLoading}
      toolbar={<CreateServiceButton organizationId={organizationId} />}
    >
      <Table>
        <Head cells={["Послуга", "Категорія", "Ціна", "Хвилини", ""]} />
        <TableBody>
          <Empty count={data?.items.length} span={5} />
          {data?.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <NameCell icon={WrenchIcon}>
                  <span className="font-medium">{item.title}</span>
                </NameCell>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.category ?? "—"}</TableCell>
              <TableCell>{item.price} грн</TableCell>
              <TableCell>{item.duration}</TableCell>
              <TableCell className="text-right">
                <RecordActions>
                  <EditServiceButton organizationId={organizationId} service={item} />
                  <DeleteEntityButton
                    title="Видалити послугу"
                    onDelete={() => remove.mutateAsync({ organizationId, serviceId: item.id })}
                  />
                </RecordActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
  );
};

const Bookings = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const query = useQuery(
    orpc.admin.booking.listBookings.queryOptions({
      input: scope(organizationId, table.search, table.page),
    }),
  );
  const remove = useMutation(
    orpc.admin.booking.deleteBooking.mutationOptions({
      onSuccess: () => {
        toast.success("Запис видалено");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.booking.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <Frame
      table={table}
      placeholder="Номер запису або номер авто"
      data={query.data}
      isLoading={query.isLoading}
      toolbar={<CreateBookingButton organizationId={organizationId} />}
    >
      <Table>
        <Head cells={["Час", "Авто", "Майстер", "Сума", "Статус", ""]} />
        <TableBody>
          <Empty count={query.data?.items.length} span={6} />
          {query.data?.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <NameCell icon={CalendarIcon}>
                  <Link
                    to="/bookings/$bookingId"
                    params={{ bookingId: item.id }}
                    className="font-medium hover:underline"
                  >
                    {new Date(item.startTime).toLocaleString("uk-UA")}
                  </Link>
                </NameCell>
              </TableCell>
              <TableCell>
                {item.vehicle.make} {item.vehicle.model}
                <div className="text-xs text-muted-foreground">{item.vehicle.licensePlate ?? "без номера"}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.employeeName}</TableCell>
              <TableCell>{item.totalPrice} грн</TableCell>
              <TableCell>
                <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <RecordActions>
                  <EditBookingButton organizationId={organizationId} bookingId={item.id} />
                  <DeleteEntityButton
                    title="Видалити запис"
                    onDelete={() => remove.mutateAsync({ organizationId, bookingId: item.id })}
                  />
                </RecordActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
  );
};

const scope = (organizationId: string, search: string, page: number) => ({
  organizationId,
  search: search || undefined,
  page,
  pageSize: PAGE_SIZE,
});

const Frame = ({
  table,
  placeholder,
  data,
  isLoading,
  toolbar,
  children,
}: {
  table: ReturnType<typeof useTableState>;
  placeholder: string;
  data?: { total: number; totalPages: number };
  isLoading: boolean;
  toolbar?: ReactNode;
  children: ReactNode;
}) => (
  <TableFrame
    search={table.search}
    onSearch={table.onSearch}
    searchPlaceholder={placeholder}
    page={table.page}
    totalPages={data?.totalPages ?? 0}
    total={data?.total ?? 0}
    onPageChange={table.setPage}
    isLoading={isLoading}
    toolbar={toolbar}
  >
    {children}
  </TableFrame>
);

const Head = ({ cells }: { cells: string[] }) => (
  <TableHeader className="sticky top-0 z-10 bg-card">
    <TableRow>
      {cells.map((cell) => (
        <TableHead key={cell}>{cell}</TableHead>
      ))}
    </TableRow>
  </TableHeader>
);

const Empty = ({ count, span }: { count?: number; span: number }) =>
  count === 0 ? (
    <TableRow>
      <TableCell colSpan={span} className="h-24 text-center text-muted-foreground">
        Нічого не знайдено
      </TableCell>
    </TableRow>
  ) : null;
