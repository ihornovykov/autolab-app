import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import z from "zod";

import { BookingOvertimeNotice } from "@/features/booking/ui/booking-overtime-notice";
import { range } from "@/shared/lib/arrays";
import { formatPrice } from "@/shared/lib/format";
import { formatFieldErrors } from "@/shared/lib/format-field-errors";
import { orpc } from "@/shared/api/orpc";
import { StatusLight } from "@/shared/ui/status-light";
import { DateTimePicker } from "@autolab/ui/components/date-time-picker";
import { Label } from "@autolab/ui/components/label";
import { MultiSelect } from "@autolab/ui/components/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { Textarea } from "@autolab/ui/components/textarea";
import { Skeleton } from "@autolab/ui/components/skeleton";

export type BookingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type VehicleBookingFormValues = {
  employeeId: string;
  serviceIds: string[];
  startTime: string;
  endTime: string;
  allowsOvertime: boolean;
  notes?: string;
  status: BookingStatus;
};

type EmployeeOption = {
  id: string;
  label: string;
};

type ServiceOption = {
  id: string;
  title: string;
  price: string;
  duration: number;
};

type InitialValues = Partial<VehicleBookingFormValues> & {
  employeeId?: string;
  serviceIds?: string[];
  startTime?: string;
  endTime?: string;
  allowsOvertime?: boolean;
  notes?: string;
  status?: BookingStatus;
};

type Props = {
  formId: string;
  organizationId: string;
  employees: EmployeeOption[];
  services: ServiceOption[];
  onSubmit: (values: VehicleBookingFormValues) => void;
  initialValues?: InitialValues;
  showStatus?: boolean;
};

const bookingStatuses: BookingStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Заплановано",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
};

const vehicleBookingFormSchema = z
  .object({
    employeeId: z.string().min(1, "Працівник обов'язковий"),
    serviceIds: z.array(z.string()).min(1, "Оберіть хоча б одну послугу"),
    startTime: z.string().min(1, "Дата і час обов'язкові"),
    endTime: z.string().min(1, "Дата і час закінчення обов'язкові"),
    allowsOvertime: z.boolean(),
    notes: z.string(),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  })
  .refine((values) => dayjs(values.endTime).isAfter(dayjs(values.startTime)), {
    message: "Час закінчення має бути після часу початку",
    path: ["endTime"],
  });

const computeEndTimeFromServices = (
  startTime: string,
  serviceIds: string[],
  services: ServiceOption[],
) => {
  const duration = services
    .filter((service) => serviceIds.includes(service.id))
    .reduce((sum, service) => sum + service.duration, 0);

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
}: Props) => {
  const defaultStartTime =
    initialValues?.startTime ??
    dayjs().add(1, "hour").minute(0).second(0).format("YYYY-MM-DDTHH:mm");
  const defaultServiceIds = initialValues?.serviceIds ?? [];

  const form = useForm({
    defaultValues: {
      employeeId: initialValues?.employeeId ?? "",
      serviceIds: defaultServiceIds,
      startTime: defaultStartTime,
      endTime:
        initialValues?.endTime ??
        computeEndTimeFromServices(defaultStartTime, defaultServiceIds, services),
      allowsOvertime: initialValues?.allowsOvertime ?? false,
      notes: initialValues?.notes ?? "",
      status: initialValues?.status ?? "PENDING",
    },
    validators: {
      onSubmit: vehicleBookingFormSchema,
    },
    onSubmit: async ({ value }) =>
      onSubmit({
        employeeId: value.employeeId,
        serviceIds: value.serviceIds,
        startTime: value.startTime,
        endTime: value.endTime,
        allowsOvertime: value.allowsOvertime,
        notes: value.notes.trim() || undefined,
        status: value.status,
      }),
  });

  const syncEndTime = (startTime: string, serviceIds: string[]) => {
    form.setFieldValue(
      "endTime",
      computeEndTimeFromServices(startTime, serviceIds, services),
    );
  };

  const employeeId = useStore(form.store, (state) => state.values.employeeId);
  const startTimeValue = useStore(form.store, (state) => state.values.startTime);
  const endTimeValue = useStore(form.store, (state) => state.values.endTime);
  const allowsOvertime = useStore(form.store, (state) => state.values.allowsOvertime);

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

  const serviceOptions = useMemo(
    () =>
      services.map((service) => ({
        value: service.id,
        label: service.title,
        description: `${formatPrice(service.price)} · ${service.duration} хв`,
      })),
    [services],
  );

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <p className="text-sm font-medium">Запис</p>
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
                syncEndTime(value, form.getFieldValue("serviceIds"));
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

      <form.Field name="serviceIds">
        {(field) => (
          <ServicePicker
            services={services}
            serviceOptions={serviceOptions}
            value={field.state.value}
            onChange={(value) => {
              field.handleChange(value);
              syncEndTime(form.getFieldValue("startTime"), value);
            }}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
    </form>
  );
};

type ServicePickerProps = {
  services: ServiceOption[];
  serviceOptions: Array<{ value: string; label: string; description?: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

const ServicePicker = ({ services, serviceOptions, value, onChange, error }: ServicePickerProps) => {
  const totals = useMemo(() => {
    const picked = services.filter((service) => value.includes(service.id));
    return {
      price: picked.reduce((sum, service) => sum + Number(service.price), 0),
      duration: picked.reduce((sum, service) => sum + service.duration, 0),
    };
  }, [services, value]);

  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-4">
      <MultiSelect
        label="Послуги *"
        placeholder="Оберіть послуги"
        searchPlaceholder="Пошук послуг..."
        emptyMessage="Немає послуг у прайс-листі"
        options={serviceOptions}
        value={value}
        onChange={onChange}
        error={error}
      />

      {value.length > 0 ? (
        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Разом</span>
          <span className="font-semibold tabular-nums">
            {formatPrice(totals.price)} · {totals.duration} хв
          </span>
        </div>
      ) : null}
    </div>
  );
};

export const VehicleBookingFormSkeleton = () => (
  <div className="space-y-4">
    {range(6).map((index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
    <Skeleton className="h-20 w-full rounded-md" />
  </div>
);
