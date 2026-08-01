import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import z from "zod";

import {
  computeBookingDiscountAmount,
  computeBookingItemsTotal,
  formatBookingTotalPrice,
} from "@/features/booking/lib/utils";

import {
  BookingServicePicker,
  type BookingServiceCatalogItem,
  type BookingServiceLineItem,
} from "@/features/booking/ui/booking-service-picker";
import { BookingOvertimeNotice } from "@/features/booking/ui/booking-overtime-notice";
import { range } from "@/shared/lib/arrays";
import { formatFieldErrors } from "@/shared/lib/errors";
import { orpc } from "@/shared/api/orpc";
import { StatusLight } from "@/shared/ui/status-light";
import { DateTimePicker } from "@autolab/ui/components/date-time-picker";
import { Label } from "@autolab/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { Textarea } from "@autolab/ui/components/textarea";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { Input } from "@autolab/ui/components/input";
import { formatPrice } from "@/shared/lib/money";

export type BookingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type VehicleBookingFormValues = {
  employeeId: string;
  items: BookingServiceLineItem[];
  startTime: string;
  endTime: string;
  allowsOvertime: boolean;
  notes?: string;
  status: BookingStatus;
  totalPrice?: string;
};

type EmployeeOption = {
  id: string;
  label: string;
};

type InitialValues = Partial<VehicleBookingFormValues> & {
  employeeId?: string;
  items?: BookingServiceLineItem[];
  startTime?: string;
  endTime?: string;
  allowsOvertime?: boolean;
  notes?: string;
  status?: BookingStatus;
  totalPrice?: string;
};

type Props = {
  formId: string;
  organizationId: string;
  employees: EmployeeOption[];
  services: BookingServiceCatalogItem[];
  onSubmit: (values: VehicleBookingFormValues) => void;
  initialValues?: InitialValues;
  showStatus?: boolean;
  allowTotalPriceOverride?: boolean;
};

const bookingStatuses: BookingStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Заплановано",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
};

const normalizeTotalPrice = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed < 0) return "0.00";
  return parsed.toFixed(2);
};

const formatTotalPriceOnBlur = (value: string) => {
  const parsed = Number(normalizeTotalPrice(value));
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

const formatTotalPriceForEdit = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "";
  return parsed.toFixed(2).replace(".", ",");
};

type TotalPriceInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const TotalPriceInput = ({ value, onChange }: TotalPriceInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  return (
    <Input
      type="text"
      inputMode="decimal"
      className="h-10 tabular-nums"
      value={isEditing ? draft : formatTotalPriceOnBlur(value)}
      onFocus={() => setDraft(formatTotalPriceForEdit(value))}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const nextValue = normalizeTotalPrice(draft ?? value);
        onChange(nextValue);
        setDraft(null);
      }}
    />
  );
};

const createVehicleBookingFormSchema = (allowTotalPriceOverride: boolean) =>
  z
    .object({
      employeeId: z.string().min(1, "Працівник обов'язковий"),
      items: z
        .array(
          z.object({
            serviceId: z.string().min(1),
            quantity: z.number().int().min(1).max(99),
            unitPrice: z.string().min(1),
          }),
        )
        .min(1, "Оберіть хоча б одну послугу"),
      startTime: z.string().min(1, "Дата і час обов'язкові"),
      endTime: z.string().min(1, "Дата і час закінчення обов'язкові"),
      allowsOvertime: z.boolean(),
      notes: z.string(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
      totalPrice: z.string(),
    })
    .superRefine((values, ctx) => {
      if (!dayjs(values.endTime).isAfter(dayjs(values.startTime))) {
        ctx.addIssue({
          code: "custom",
          message: "Час закінчення має бути після часу початку",
          path: ["endTime"],
        });
      }

      if (allowTotalPriceOverride && !values.totalPrice.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Загальна вартість обов'язкова",
          path: ["totalPrice"],
        });
      }
    });

const computeEndTimeFromItems = (
  startTime: string,
  items: BookingServiceLineItem[],
  services: BookingServiceCatalogItem[],
) => {
  const serviceMap = new Map(services.map((service) => [service.id, service]));
  const duration = items.reduce((sum, item) => {
    const service = serviceMap.get(item.serviceId);
    return sum + (service?.duration ?? 0) * item.quantity;
  }, 0);

  return dayjs(startTime)
    .add(duration > 0 ? duration : 60, "minute")
    .format("YYYY-MM-DDTHH:mm");
};

const validateEndTimeAfterStart = ({
  value,
  fieldApi,
}: {
  value: string;
  fieldApi: { form: { getFieldValue: (name: "startTime") => string } };
}) => {
  const startTime = fieldApi.form.getFieldValue("startTime");
  if (!startTime || !value) return undefined;
  if (!dayjs(value).isAfter(dayjs(startTime))) {
    return "Час закінчення має бути після часу початку";
  }
  return undefined;
};

export const VehicleBookingForm = ({
  formId,
  organizationId,
  employees,
  services,
  onSubmit,
  initialValues,
  showStatus = false,
  allowTotalPriceOverride = false,
}: Props) => {
  const defaultStartTime =
    initialValues?.startTime ??
    dayjs().add(1, "hour").minute(0).second(0).format("YYYY-MM-DDTHH:mm");
  const defaultItems = initialValues?.items ?? [];
  const defaultTotalPrice = initialValues?.totalPrice
    ? normalizeTotalPrice(initialValues.totalPrice)
    : formatBookingTotalPrice(computeBookingItemsTotal(defaultItems));

  const previousItemsSubtotalRef = useRef(computeBookingItemsTotal(defaultItems));

  const form = useForm({
    defaultValues: {
      employeeId: initialValues?.employeeId ?? "",
      items: defaultItems,
      startTime: defaultStartTime,
      endTime:
        initialValues?.endTime ??
        computeEndTimeFromItems(defaultStartTime, defaultItems, services),
      allowsOvertime: initialValues?.allowsOvertime ?? false,
      notes: initialValues?.notes ?? "",
      status: initialValues?.status ?? "PENDING",
      totalPrice: defaultTotalPrice,
    },
    validators: {
      onSubmit: createVehicleBookingFormSchema(allowTotalPriceOverride),
    },
    onSubmit: async ({ value }) =>
      onSubmit({
        employeeId: value.employeeId,
        items: value.items,
        startTime: value.startTime,
        endTime: value.endTime,
        allowsOvertime: value.allowsOvertime,
        notes: value.notes.trim() || undefined,
        status: value.status,
        totalPrice: allowTotalPriceOverride ? value.totalPrice : undefined,
      }),
  });

  const syncEndTime = (startTime: string, items: BookingServiceLineItem[]) => {
    form.setFieldValue("endTime", computeEndTimeFromItems(startTime, items, services));
  };

  const employeeId = useStore(form.store, (state) => state.values.employeeId);
  const startTimeValue = useStore(form.store, (state) => state.values.startTime);
  const endTimeValue = useStore(form.store, (state) => state.values.endTime);
  const allowsOvertime = useStore(form.store, (state) => state.values.allowsOvertime);
  const itemsValue = useStore(form.store, (state) => state.values.items);
  const totalPriceValue = useStore(form.store, (state) => state.values.totalPrice);

  const itemsSubtotal = useMemo(() => computeBookingItemsTotal(itemsValue), [itemsValue]);
  const discountAmount = useMemo(
    () => computeBookingDiscountAmount(itemsSubtotal, totalPriceValue),
    [itemsSubtotal, totalPriceValue],
  );

  useEffect(() => {
    if (!allowTotalPriceOverride) return;

    const newSubtotal = computeBookingItemsTotal(itemsValue);
    const currentTotal = Number(normalizeTotalPrice(form.getFieldValue("totalPrice")));
    const previousSubtotal = previousItemsSubtotalRef.current;
    const isAutoSyncedTotal = Math.abs(currentTotal - previousSubtotal) < 0.005;

    if (isAutoSyncedTotal) {
      form.setFieldValue("totalPrice", formatBookingTotalPrice(newSubtotal));
    }

    previousItemsSubtotalRef.current = newSubtotal;
  }, [allowTotalPriceOverride, itemsValue, form]);

  const workingHoursQuery = useQuery({
    ...orpc.employee.getEmployeeWorkingHours.queryOptions({
      input: { organizationId, employeeId },
    }),
    enabled: !!employeeId,
  });

  const employeeSchedule = useMemo(
    () =>
      (workingHoursQuery.data ?? []).map((day) => ({
        weekday: day.weekday,
        openTime: day.openTime,
        closeTime: day.closeTime,
        isClosed: day.isClosed,
      })),
    [workingHoursQuery.data],
  );

  const employeeItems = employees.map((employee) => ({
    value: employee.id,
    label: employee.label,
  }));

  const statusItems = bookingStatuses.map((status) => ({
    value: status,
    label: statusLabels[status],
  }));

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="items">
        {(field) => (
          <BookingServicePicker
            services={services}
            value={field.state.value}
            onChange={(value) => {
              field.handleChange(value);
              syncEndTime(form.getFieldValue("startTime"), value);
            }}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <p className="text-sm font-medium">Час і виконавець</p>
          <p className="text-xs text-muted-foreground">
            Призначте працівника та час обслуговування
          </p>
        </div>

        {showStatus ? (
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="booking-status">Статус *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange((value ?? "PENDING") as BookingStatus)}
                  items={statusItems}
                >
                  <SelectTrigger id="booking-status">
                    <SelectValue placeholder="Оберіть статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <StatusLight status={status} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        ) : null}

        <form.Field name="employeeId">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="booking-employee">Працівник *</Label>
              <Select
                value={field.state.value || null}
                onValueChange={(value) => field.handleChange(value ?? "")}
                items={employeeItems}
              >
                <SelectTrigger id="booking-employee">
                  <SelectValue placeholder="Оберіть працівника" />
                </SelectTrigger>
                <SelectContent>
                  {employeeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formatFieldErrors(field.state.meta.errors) ? (
                <p className="text-sm text-red-500">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field name="startTime">
          {(field) => (
            <DateTimePicker
              label="Дата і час початку *"
              placeholder="Оберіть дату та час початку"
              value={field.state.value}
              onChange={(value) => {
                field.handleChange(value);
                syncEndTime(value, form.getFieldValue("items"));
                form.validateField("endTime", "change");
              }}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="endTime"
          validators={{
            onChangeListenTo: ["startTime"],
            onChange: validateEndTimeAfterStart,
          }}
        >
          {(field) => (
            <DateTimePicker
              label="Дата і час закінчення *"
              placeholder="Оберіть дату та час закінчення"
              value={field.state.value}
              onChange={field.handleChange}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <BookingOvertimeNotice
          startTime={startTimeValue}
          endTime={endTimeValue}
          schedule={employeeSchedule}
          allowsOvertime={allowsOvertime}
          onAllowsOvertimeChange={(value) => form.setFieldValue("allowsOvertime", value)}
        />

        <form.Field name="notes">
          {(field) => (
            <Textarea
              label="Примітки"
              placeholder="Додаткова інформація про запис"
              className="min-h-20 resize-none"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </form.Field>
      </div>

      {allowTotalPriceOverride ? (
        <div className="space-y-4 rounded-xl border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Фінальна вартість</p>
            <p className="text-xs text-muted-foreground">
              За замовчуванням — сума послуг, але можна змінити вручну
            </p>
          </div>
          <form.Field name="totalPrice">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="booking-total-price">Сума до оплати *</Label>
                <TotalPriceInput value={field.state.value} onChange={field.handleChange} />
                {discountAmount > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm">
                    <span className="text-muted-foreground line-through tabular-nums">
                      {formatPrice(itemsSubtotal)}
                    </span>
                    <span className="font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                      Знижка: −{formatPrice(discountAmount)}
                    </span>
                  </div>
                ) : null}
                {formatFieldErrors(field.state.meta.errors) ? (
                  <p className="text-sm text-red-500">
                    {formatFieldErrors(field.state.meta.errors)}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
        </div>
      ) : null}
    </form>
  );
};

export const VehicleBookingFormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full rounded-xl" />
    {range(5).map((index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
    <Skeleton className="h-20 w-full rounded-md" />
  </div>
);
