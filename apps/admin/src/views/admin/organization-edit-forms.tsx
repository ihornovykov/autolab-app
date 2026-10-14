import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Input } from "@autolab/ui/components/input";
import { Textarea } from "@autolab/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import {
  DialogButtons,
  Field,
  invalidateOrganization,
  onMutationError,
  OptionSelect,
  selectClass,
} from "@/views/admin/organization-forms";

const vehicleTypes = [
  { value: "CAR", label: "Легкове" },
  { value: "MOTORCYCLE", label: "Мотоцикл" },
  { value: "TRUCK", label: "Вантажівка" },
  { value: "VAN", label: "Фургон" },
  { value: "BUS", label: "Автобус" },
  { value: "OTHER", label: "Інше" },
] as const;

const bookingStatuses = [
  { value: "PENDING", label: "Очікує" },
  { value: "IN_PROGRESS", label: "В роботі" },
  { value: "COMPLETED", label: "Виконано" },
  { value: "CANCELLED", label: "Скасовано" },
] as const;

type VehicleType = (typeof vehicleTypes)[number]["value"];
type BookingStatus = (typeof bookingStatuses)[number]["value"];

export type ClientRecord = {
  id: string;
  firstName: string;
  lastName: string | null;
  middleName: string | null;
  phone: string | null;
};

export type VehicleRecord = {
  id: string;
  clientId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string | null;
  vin: string | null;
  engine: string | null;
  engineVolume: number | null;
  bodyStyle: string | null;
  notes: string | null;
};

export type ServiceRecord = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  price: string;
  duration: number;
};

type BookingLine = {
  serviceId: string;
  quantity: string;
  unitPrice: string;
  duration: string;
};

const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EditTrigger = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button type="button" variant="ghost" size="icon-sm" aria-label={label} onClick={onClick}>
    <PencilIcon />
  </Button>
);

export const EditClientButton = ({
  organizationId,
  client,
}: {
  organizationId: string;
  client: ClientRecord;
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(client.firstName);
  const [lastName, setLastName] = useState(client.lastName ?? "");
  const [middleName, setMiddleName] = useState(client.middleName ?? "");
  const [phone, setPhone] = useState(client.phone ?? "");
  const mutation = useMutation(
    orpc.admin.organization.updateClient.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Клієнта оновлено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  useEffect(() => {
    if (!open) return;
    setFirstName(client.firstName);
    setLastName(client.lastName ?? "");
    setMiddleName(client.middleName ?? "");
    setPhone(client.phone ?? "");
  }, [open, client]);

  return (
    <>
      <EditTrigger label="Редагувати клієнта" onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Редагувати клієнта"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            disabled={!firstName.trim()}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                clientId: client.id,
                firstName,
                lastName: lastName || null,
                middleName: middleName || null,
                phone: phone || null,
              })
            }
          />
        }
      >
        <div className="grid gap-3">
          <Input label="Імʼя" placeholder="Іван" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <Input label="Прізвище" placeholder="Іваненко" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          <Input label="По батькові" placeholder="Іванович" value={middleName} onChange={(event) => setMiddleName(event.target.value)} />
          <Input label="Телефон" placeholder="+380 67 123 45 67" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
      </Dialog>
    </>
  );
};

export const EditVehicleButton = ({
  organizationId,
  vehicle,
}: {
  organizationId: string;
  vehicle: VehicleRecord;
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(vehicle.clientId);
  const [type, setType] = useState<VehicleType>(vehicle.type);
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(String(vehicle.year));
  const [licensePlate, setLicensePlate] = useState(vehicle.licensePlate ?? "");
  const [vin, setVin] = useState(vehicle.vin ?? "");
  const [engine, setEngine] = useState(vehicle.engine ?? "");
  const [engineVolume, setEngineVolume] = useState(vehicle.engineVolume == null ? "" : String(vehicle.engineVolume));
  const [bodyStyle, setBodyStyle] = useState(vehicle.bodyStyle ?? "");
  const [notes, setNotes] = useState(vehicle.notes ?? "");
  const clients = useQuery({
    ...orpc.admin.organization.listClients.queryOptions({
      input: { organizationId, page: 1, pageSize: 100 },
    }),
    enabled: open,
  });
  const options = (clients.data as { items?: Array<{ id: string; name: string }> } | undefined)?.items ?? [];
  const mutation = useMutation(
    orpc.admin.organization.updateVehicle.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Авто оновлено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  useEffect(() => {
    if (!open) return;
    setClientId(vehicle.clientId);
    setType(vehicle.type);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(String(vehicle.year));
    setLicensePlate(vehicle.licensePlate ?? "");
    setVin(vehicle.vin ?? "");
    setEngine(vehicle.engine ?? "");
    setEngineVolume(vehicle.engineVolume == null ? "" : String(vehicle.engineVolume));
    setBodyStyle(vehicle.bodyStyle ?? "");
    setNotes(vehicle.notes ?? "");
  }, [open, vehicle]);

  const volume = engineVolume.trim() ? Number(engineVolume) : null;

  return (
    <>
      <EditTrigger label="Редагувати авто" onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        className="max-w-xl"
        title="Редагувати авто"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            disabled={!clientId || !make.trim() || !model.trim() || (volume !== null && Number.isNaN(volume))}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                vehicleId: vehicle.id,
                clientId,
                type,
                make,
                model,
                year: Number(year),
                licensePlate: licensePlate || null,
                vin: vin || null,
                engine: engine || null,
                engineVolume: volume,
                bodyStyle: bodyStyle || null,
                notes: notes || null,
              })
            }
          />
        }
      >
        <div className="grid gap-3">
          <Field label="Клієнт">
            <OptionSelect
              value={clientId}
              placeholder="Оберіть клієнта"
              options={options.map((client) => ({ value: client.id, label: client.name }))}
              onValueChange={setClientId}
            />
          </Field>
          <Field label="Тип">
            <OptionSelect
              value={type}
              options={vehicleTypes}
              onValueChange={(next) => setType(next as VehicleType)}
            />
          </Field>
          <Input label="Марка" placeholder="Toyota" value={make} onChange={(event) => setMake(event.target.value)} />
          <Input label="Модель" placeholder="Camry" value={model} onChange={(event) => setModel(event.target.value)} />
          <Input label="Рік" type="number" placeholder="2018" value={year} onChange={(event) => setYear(event.target.value)} />
          <Input label="Номер" placeholder="AA0000AA" value={licensePlate} onChange={(event) => setLicensePlate(event.target.value)} />
          <Input label="VIN" placeholder="WVWZZZ3CZWE123456" value={vin} onChange={(event) => setVin(event.target.value)} />
          <Input label="Двигун" placeholder="Бензин" value={engine} onChange={(event) => setEngine(event.target.value)} />
          <Input
            label="Обʼєм, л"
            placeholder="2.0"
            value={engineVolume}
            onChange={(event) => setEngineVolume(event.target.value)}
          />
          <Input label="Кузов" placeholder="Седан" value={bodyStyle} onChange={(event) => setBodyStyle(event.target.value)} />
          <Textarea label="Нотатки" placeholder="Пробіг, комплектація, особливості" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </Dialog>
    </>
  );
};

export const EditServiceButton = ({
  organizationId,
  service,
}: {
  organizationId: string;
  service: ServiceRecord;
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(service.title);
  const [category, setCategory] = useState(service.category ?? "");
  const [description, setDescription] = useState(service.description ?? "");
  const [price, setPrice] = useState(service.price);
  const [duration, setDuration] = useState(String(service.duration));
  const mutation = useMutation(
    orpc.admin.organization.updateService.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Послугу оновлено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  useEffect(() => {
    if (!open) return;
    setTitle(service.title);
    setCategory(service.category ?? "");
    setDescription(service.description ?? "");
    setPrice(service.price);
    setDuration(String(service.duration));
  }, [open, service]);

  return (
    <>
      <EditTrigger label="Редагувати послугу" onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Редагувати послугу"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            disabled={!title.trim() || !price.trim()}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                serviceId: service.id,
                title,
                category: category || null,
                description: description || null,
                price,
                duration: Number(duration),
              })
            }
          />
        }
      >
        <div className="grid gap-3">
          <Input label="Назва" placeholder="Заміна оливи та фільтра" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Категорія" placeholder="Двигун" value={category} onChange={(event) => setCategory(event.target.value)} />
          <Textarea label="Опис" placeholder="Короткий опис робіт" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Input label="Ціна, грн" placeholder="800" value={price} onChange={(event) => setPrice(event.target.value)} />
          <Input label="Хвилини" type="number" placeholder="60" value={duration} onChange={(event) => setDuration(event.target.value)} />
        </div>
      </Dialog>
    </>
  );
};

export const EditBookingButton = ({
  organizationId,
  bookingId,
  appearance = "icon",
}: {
  organizationId: string;
  bookingId: string;
  appearance?: "icon" | "button";
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<BookingStatus>("PENDING");
  const [notes, setNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [allowsOvertime, setAllowsOvertime] = useState(false);
  const [lines, setLines] = useState<BookingLine[]>([]);
  const listInput = { organizationId, page: 1, pageSize: 100 };
  const booking = useQuery({
    ...orpc.admin.booking.getBooking.queryOptions({ input: { id: bookingId } }),
    enabled: open,
  });
  const employees = useQuery({
    ...orpc.admin.organization.listEmployees.queryOptions({ input: listInput }),
    enabled: open,
  });
  const vehicles = useQuery({
    ...orpc.admin.organization.listVehicles.queryOptions({ input: listInput }),
    enabled: open,
  });
  const services = useQuery({
    ...orpc.admin.organization.listServices.queryOptions({ input: listInput }),
    enabled: open,
  });
  const details = booking.data as
    | {
        employeeId: string;
        vehicle: { id: string };
        startTime: string;
        endTime: string;
        status: BookingStatus;
        notes: string | null;
        totalPrice: string;
        allowsOvertime: boolean;
        services: Array<{ serviceId: string; quantity: number; unitPrice: string; duration: number }>;
      }
    | undefined;
  const employeeOptions =
    (employees.data as { items?: Array<{ id: string; name: string; isActive: boolean }> } | undefined)?.items ?? [];
  const vehicleOptions =
    (vehicles.data as { items?: Array<{ id: string; name: string; licensePlate: string | null }> } | undefined)
      ?.items ?? [];
  const serviceOptions =
    (services.data as { items?: Array<{ id: string; title: string; price: string; duration: number }> } | undefined)
      ?.items ?? [];
  const mutation = useMutation(
    orpc.admin.booking.updateBooking.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Запис оновлено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  useEffect(() => {
    if (!open || !details) return;
    setEmployeeId(details.employeeId);
    setVehicleId(details.vehicle.id);
    setStartTime(toLocalInput(details.startTime));
    setEndTime(toLocalInput(details.endTime));
    setStatus(details.status);
    setNotes(details.notes ?? "");
    setTotalPrice(details.totalPrice);
    setAllowsOvertime(details.allowsOvertime);
    setLines(
      details.services.map((line) => ({
        serviceId: line.serviceId,
        quantity: String(line.quantity),
        unitPrice: line.unitPrice,
        duration: String(line.duration),
      })),
    );
  }, [open, details]);

  const updateLine = (index: number, patch: Partial<BookingLine>) => {
    setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)));
  };

  const ready =
    Boolean(employeeId && vehicleId && startTime && endTime && totalPrice.trim()) &&
    lines.length > 0 &&
    lines.every((line) => line.serviceId && Number(line.quantity) >= 1 && Number(line.duration) >= 1 && line.unitPrice);

  return (
    <>
      {appearance === "button" ? (
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <PencilIcon />
          Редагувати
        </Button>
      ) : (
        <EditTrigger label="Редагувати запис" onClick={() => setOpen(true)} />
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        className="max-w-2xl"
        title="Редагувати запис"
        description="Авто, ціна рядка, тривалість і час задаються вручну"
        footer={
          <DialogButtons
            pending={mutation.isPending || booking.isLoading}
            disabled={!ready}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                bookingId,
                employeeId,
                vehicleId,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                allowsOvertime,
                status,
                notes: notes || null,
                totalPrice,
                items: lines.map((line) => ({
                  serviceId: line.serviceId,
                  quantity: Number(line.quantity),
                  unitPrice: line.unitPrice,
                  duration: Number(line.duration),
                })),
              })
            }
          />
        }
      >
        <div className="grid gap-3">
          <Field label="Працівник">
            <OptionSelect
              value={employeeId}
              placeholder="Оберіть працівника"
              options={employeeOptions.map((item) => ({
                value: item.id,
                label: item.isActive ? item.name : `${item.name} · неактивний`,
              }))}
              onValueChange={setEmployeeId}
            />
          </Field>
          <Field label="Авто">
            <OptionSelect
              value={vehicleId}
              placeholder="Оберіть авто"
              options={vehicleOptions.map((item) => ({
                value: item.id,
                label: item.licensePlate ? `${item.name} · ${item.licensePlate}` : item.name,
              }))}
              onValueChange={setVehicleId}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Початок">
              <input
                type="datetime-local"
                className={selectClass}
                placeholder="2026-10-14 09:00"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </Field>
            <Field label="Кінець">
              <input
                type="datetime-local"
                className={selectClass}
                placeholder="2026-10-14 10:00"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </Field>
          </div>
          <Field label="Статус">
            <OptionSelect
              value={status}
              options={bookingStatuses}
              onValueChange={(next) => setStatus(next as BookingStatus)}
            />
          </Field>
          <Input label="Сума, грн" placeholder="1200" value={totalPrice} onChange={(event) => setTotalPrice(event.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowsOvertime}
              onChange={(event) => setAllowsOvertime(event.target.checked)}
            />
            Дозволити понаднормові
          </label>
          <Textarea label="Нотатки" placeholder="Додаткова інформація про запис" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Послуги</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setLines((current) => [...current, { serviceId: "", quantity: "1", unitPrice: "", duration: "60" }])
                }
              >
                Додати рядок
              </Button>
            </div>
            {lines.map((line, index) => (
              <div key={`${line.serviceId}-${index}`} className="grid gap-2 rounded-md border p-3">
                <Field label="Послуга">
                  <OptionSelect
                    value={line.serviceId}
                    placeholder="Оберіть послугу"
                    options={serviceOptions.map((item) => ({ value: item.id, label: item.title }))}
                    onValueChange={(next) => {
                      const selected = serviceOptions.find((item) => item.id === next);
                      updateLine(index, {
                        serviceId: next,
                        unitPrice: selected?.price ?? line.unitPrice,
                        duration: selected ? String(selected.duration) : line.duration,
                      });
                    }}
                  />
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Кількість"
                    type="number"
                    placeholder="1"
                    value={line.quantity}
                    onChange={(event) => updateLine(index, { quantity: event.target.value })}
                  />
                  <Input
                    label="Ціна"
                    placeholder="800"
                    value={line.unitPrice}
                    onChange={(event) => updateLine(index, { unitPrice: event.target.value })}
                  />
                  <Input
                    label="Хвилини"
                    type="number"
                    placeholder="60"
                    value={line.duration}
                    onChange={(event) => updateLine(index, { duration: event.target.value })}
                  />
                </div>
                {lines.length > 1 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}>
                    Прибрати рядок
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export const RecordActions = ({ children }: { children: ReactNode }) => (
  <div className="flex justify-end">{children}</div>
);
