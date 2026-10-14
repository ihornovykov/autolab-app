import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Input } from "@autolab/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { Textarea } from "@autolab/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";

export const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring";

const weekdayLabels: Record<number, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
  7: "Нд",
};

type DayHours = {
  weekday: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

const defaultHours = (): DayHours[] =>
  [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    openTime: weekday === 7 ? "" : "09:00",
    closeTime: weekday === 7 ? "" : "18:00",
    isClosed: weekday === 7,
  }));

const mergeHours = (
  hours: Array<{ weekday: number; openTime: string | null; closeTime: string | null; isClosed: boolean }>,
): DayHours[] => {
  const byDay = new Map(hours.map((day) => [day.weekday, day]));
  return defaultHours().map((day) => {
    const existing = byDay.get(day.weekday);
    if (!existing) return day;
    return {
      weekday: day.weekday,
      isClosed: existing.isClosed,
      openTime: existing.openTime?.slice(0, 5) ?? "",
      closeTime: existing.closeTime?.slice(0, 5) ?? "",
    };
  });
};

const coordinate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return Number(trimmed);
};

const roles = [
  { value: "OWNER", label: "Власник" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "TECHNICIAN", label: "Майстер" },
] as const;

type Role = (typeof roles)[number]["value"];

export const invalidateOrganization = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
  await queryClient.invalidateQueries({ queryKey: orpc.admin.booking.key() });
};

export const onMutationError = (error: { message: string }) => {
  toast.error(error.message);
};

export const CreateOrganizationButton = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const mutation = useMutation(
    orpc.admin.organization.createOrganization.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setOwnerEmail("");
        toast.success("Майстерню створено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <PlusIcon />
        Створити
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Нова майстерня"
        description="Базовий каталог послуг додасться автоматично"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                name,
                phone,
                email,
                address,
                ownerEmail,
              })
            }
          />
        }
      >
        <div className="grid gap-3">
          <Input label="Назва" placeholder="AutoLab СТО" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="Телефон" placeholder="+380 67 123 45 67" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input label="Email" type="email" placeholder="info@autolab.ua" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Адреса" placeholder="вул. Хрещатик, 1, Київ" value={address} onChange={(event) => setAddress(event.target.value)} />
          <Input
            label="Email власника"
            type="email"
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
            placeholder="Існуючий користувач платформи"
          />
        </div>
      </Dialog>
    </>
  );
};

type OrganizationFields = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  workingHours: Array<{ weekday: number; openTime: string | null; closeTime: string | null; isClosed: boolean }>;
};

export const OrganizationHeaderActions = ({ organizationId }: { organizationId: string }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery(
    orpc.admin.organization.getOrganization.queryOptions({ input: { id: organizationId } }),
  );
  const organization = query.data as OrganizationFields | undefined;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [hours, setHours] = useState<DayHours[]>(defaultHours);

  useEffect(() => {
    if (!open || !organization) return;
    setName(organization.name);
    setSlug(organization.slug);
    setLogo(organization.logo ?? "");
    setDescription(organization.description ?? "");
    setAddress(organization.address ?? "");
    setPhone(organization.phone ?? "");
    setEmail(organization.email ?? "");
    setWebsite(organization.website ?? "");
    setLatitude(organization.latitude == null ? "" : String(organization.latitude));
    setLongitude(organization.longitude == null ? "" : String(organization.longitude));
    setHours(mergeHours(organization.workingHours ?? []));
  }, [open, organization]);

  const update = useMutation(
    orpc.admin.organization.updateOrganization.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Майстерню оновлено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );
  const remove = useMutation(
    orpc.admin.organization.deleteOrganization.mutationOptions({
      onSuccess: async () => {
        toast.success("Майстерню видалено");
        await invalidateOrganization(queryClient);
        await navigate({ to: "/organizations" });
      },
      onError: onMutationError,
    }),
  );

  return (
    <div className="flex shrink-0 gap-2">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <PencilIcon />
        Редагувати
      </Button>
      <DeleteRowButton
        title="Видалити майстерню"
        description="Разом з нею зникнуть працівники, клієнти, послуги й записи."
        pending={remove.isPending}
        onDelete={() => remove.mutateAsync({ id: organizationId })}
        trigger={
          <Button type="button" variant="outline">
            <Trash2Icon />
            Видалити
          </Button>
        }
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        className="max-w-2xl"
        title="Редагувати майстерню"
        description="Повний профіль: контакти, slug, логотип, координати і графік"
        footer={
          <DialogButtons
            pending={update.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={() => {
              const lat = coordinate(latitude);
              const lng = coordinate(longitude);
              if ((lat !== null && Number.isNaN(lat)) || (lng !== null && Number.isNaN(lng))) {
                toast.error("Некоректні координати");
                return;
              }
              update.mutate({
                id: organizationId,
                name,
                slug,
                logo: logo || null,
                description: description || null,
                address: address || null,
                phone: phone || null,
                email: email || null,
                website: website || null,
                latitude: lat,
                longitude: lng,
                workingHours: hours.map((day) => ({
                  weekday: day.weekday,
                  isClosed: day.isClosed,
                  openTime: day.isClosed ? null : day.openTime || null,
                  closeTime: day.isClosed ? null : day.closeTime || null,
                })),
              });
            }}
          />
        }
      >
        <div className="grid gap-3">
          <Input label="Назва" placeholder="AutoLab СТО" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Slug" placeholder="autolab-sto" value={slug} onChange={(event) => setSlug(event.target.value)} />
          <Input label="Логотип, URL" placeholder="https://example.com/logo.png" value={logo} onChange={(event) => setLogo(event.target.value)} />
          <Input label="Телефон" placeholder="+380 67 123 45 67" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input label="Email" placeholder="info@autolab.ua" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Сайт" placeholder="https://autolab.ua" value={website} onChange={(event) => setWebsite(event.target.value)} />
          <Input label="Адреса" placeholder="вул. Хрещатик, 1, Київ" value={address} onChange={(event) => setAddress(event.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Широта" placeholder="50.4501" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
            <Input label="Довгота" placeholder="30.5234" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
          </div>
          <Textarea label="Опис" placeholder="Короткий опис майстерні та послуг" value={description} onChange={(event) => setDescription(event.target.value)} />
          <div className="grid gap-2">
            <span className="text-sm font-medium">Години роботи</span>
            {hours.map((day) => (
              <div key={day.weekday} className="grid grid-cols-[2.5rem_5.5rem_1fr_1fr] items-center gap-2">
                <span className="text-sm">{weekdayLabels[day.weekday]}</span>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={day.isClosed}
                    onChange={(event) =>
                      setHours((current) =>
                        current.map((item) =>
                          item.weekday === day.weekday ? { ...item, isClosed: event.target.checked } : item,
                        ),
                      )
                    }
                  />
                  Вихідний
                </label>
                <input
                  type="time"
                  className={selectClass}
                  disabled={day.isClosed}
                  value={day.openTime}
                  placeholder="09:00"
                  aria-label={`${weekdayLabels[day.weekday]} відкриття`}
                  onChange={(event) =>
                    setHours((current) =>
                      current.map((item) =>
                        item.weekday === day.weekday ? { ...item, openTime: event.target.value } : item,
                      ),
                    )
                  }
                />
                <input
                  type="time"
                  className={selectClass}
                  disabled={day.isClosed}
                  value={day.closeTime}
                  placeholder="18:00"
                  aria-label={`${weekdayLabels[day.weekday]} закриття`}
                  onChange={(event) =>
                    setHours((current) =>
                      current.map((item) =>
                        item.weekday === day.weekday ? { ...item, closeTime: event.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const CreateEmployeeButton = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("TECHNICIAN");
  const mutation = useMutation(
    orpc.admin.organization.createEmployee.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        setEmail("");
        toast.success("Працівника додано");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Новий працівник"
        description="Користувач уже має бути зареєстрований на платформі"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={() => mutation.mutate({ organizationId, email, role })}
          />
        }
      >
        <div className="grid gap-3">
          <Input label="Email" type="email" placeholder="example@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <RoleField value={role} onChange={setRole} />
        </div>
      </Dialog>
    </>
  );
};

export const CreateClientButton = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const mutation = useMutation(
    orpc.admin.organization.createClient.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        setFirstName("");
        setLastName("");
        setPhone("");
        toast.success("Клієнта додано");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Новий клієнт"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={() => mutation.mutate({ organizationId, firstName, lastName, phone })}
          />
        }
      >
        <div className="grid gap-3">
          <Input label="Імʼя" placeholder="Іван" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <Input label="Прізвище" placeholder="Іваненко" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          <Input label="Телефон" placeholder="+380 67 123 45 67" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
      </Dialog>
    </>
  );
};

export const CreateVehicleButton = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [licensePlate, setLicensePlate] = useState("");
  const clients = useQuery({
    ...orpc.admin.organization.listClients.queryOptions({
      input: { organizationId, page: 1, pageSize: 100 },
    }),
    enabled: open,
  });
  const options = (clients.data as { items?: Array<{ id: string; name: string }> } | undefined)?.items ?? [];
  const mutation = useMutation(
    orpc.admin.organization.createVehicle.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Авто додано");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Нове авто"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            disabled={!clientId}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                clientId,
                make,
                model,
                year: Number(year),
                licensePlate,
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
          <Input label="Марка" placeholder="Toyota" value={make} onChange={(event) => setMake(event.target.value)} />
          <Input label="Модель" placeholder="Camry" value={model} onChange={(event) => setModel(event.target.value)} />
          <Input label="Рік" type="number" placeholder="2018" value={year} onChange={(event) => setYear(event.target.value)} />
          <Input label="Номер" placeholder="AA0000AA" value={licensePlate} onChange={(event) => setLicensePlate(event.target.value)} />
        </div>
      </Dialog>
    </>
  );
};

export const CreateServiceButton = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const mutation = useMutation(
    orpc.admin.organization.createService.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        setTitle("");
        setCategory("");
        setPrice("");
        toast.success("Послугу додано");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Нова послуга"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                title,
                category,
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
          <Input label="Ціна, грн" placeholder="800" value={price} onChange={(event) => setPrice(event.target.value)} />
          <Input label="Хвилини" type="number" placeholder="60" value={duration} onChange={(event) => setDuration(event.target.value)} />
        </div>
      </Dialog>
    </>
  );
};

export const CreateBookingButton = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const listInput = { organizationId, page: 1, pageSize: 100 };
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
  const employeeOptions =
    (employees.data as { items?: Array<{ id: string; name: string }> } | undefined)?.items ?? [];
  const vehicleOptions =
    (vehicles.data as { items?: Array<{ id: string; name: string; licensePlate: string | null }> } | undefined)
      ?.items ?? [];
  const serviceOptions =
    (services.data as { items?: Array<{ id: string; title: string }> } | undefined)?.items ?? [];
  const mutation = useMutation(
    orpc.admin.booking.createBooking.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        toast.success("Запис створено");
        await invalidateOrganization(queryClient);
      },
      onError: onMutationError,
    }),
  );

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Новий запис"
        footer={
          <DialogButtons
            pending={mutation.isPending}
            disabled={!employeeId || !vehicleId || !serviceId || !startTime}
            onCancel={() => setOpen(false)}
            onSubmit={() =>
              mutation.mutate({
                organizationId,
                employeeId,
                vehicleId,
                serviceId,
                startTime: new Date(startTime).toISOString(),
                quantity: 1,
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
              options={employeeOptions.map((item) => ({ value: item.id, label: item.name }))}
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
          <Field label="Послуга">
            <OptionSelect
              value={serviceId}
              placeholder="Оберіть послугу"
              options={serviceOptions.map((item) => ({ value: item.id, label: item.title }))}
              onValueChange={setServiceId}
            />
          </Field>
          <Field label="Початок">
            <input
              type="datetime-local"
              className={selectClass}
              placeholder="2026-10-14 09:00"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </Field>
        </div>
      </Dialog>
    </>
  );
};

export const DeleteEntityButton = ({
  title,
  onDelete,
}: {
  title: string;
  onDelete: () => Promise<unknown>;
}) => (
  <DeleteRowButton
    title={title}
    onDelete={onDelete}
    trigger={
      <Button type="button" variant="ghost" size="icon-sm" aria-label={title}>
        <Trash2Icon />
      </Button>
    }
  />
);

const DeleteRowButton = ({
  title,
  description = "Цю дію не можна скасувати.",
  onDelete,
  pending,
  trigger,
}: {
  title: string;
  description?: string;
  onDelete: () => Promise<unknown>;
  pending?: boolean;
  trigger: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const confirm = async () => {
    try {
      await onDelete();
      setOpen(false);
    } catch {
      setOpen(true);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Скасувати
            </Button>
            <Button type="button" variant="destructive" isLoading={pending} onClick={() => void confirm()}>
              Видалити
            </Button>
          </div>
        }
      />
    </>
  );
};

const AddButton = ({ onClick }: { onClick: () => void }) => (
  <Button type="button" onClick={onClick}>
    <PlusIcon />
    Додати
  </Button>
);

export const DialogButtons = ({
  pending,
  disabled,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Скасувати
      </Button>
      <Button type="submit" isLoading={pending} disabled={disabled}>
        Зберегти
      </Button>
    </form>
  );
};

const RoleField = ({ value, onChange }: { value: Role; onChange: (value: Role) => void }) => (
  <Field label="Роль">
    <OptionSelect value={value} options={roles} onValueChange={(next) => onChange(next as Role)} />
  </Field>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1 text-sm">
    <span className="font-medium">{label}</span>
    {children}
  </div>
);

type SelectOption = { value: string; label: string };

export const OptionSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) => (
  <Select
    value={value || null}
    items={options.map((option) => ({ value: option.value, label: option.label }))}
    onValueChange={(next) => {
      if (next) onValueChange(next);
    }}
  >
    <SelectTrigger aria-label={ariaLabel} className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const employeeRoles = roles;
