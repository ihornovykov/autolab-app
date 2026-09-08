import { useForm } from "@tanstack/react-form";
import { UserPlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import z from "zod";

import type { ClientFormValues } from "@/features/client/ui/client-form";
import { splitClientNameQuery } from "@/features/client/lib/utils";
import {
  bodyStyleOptions,
  fuelOptions,
  useVehicleMakes,
  useVehicleModels,
} from "@/features/vehicle/hooks/use-vehicle-catalog";
import {
  findOptionLabel,
  findOptionValueByLabel,
  isCustomOptionValue,
  resolveInitialOptionValue,
  resolveOptionLabel,
} from "@/features/vehicle/lib/utils";
import { range } from "@/shared/lib/arrays";
import { formatFieldErrors } from "@/shared/lib/errors";
import { YearInput } from "@/features/vehicle/ui/year-input";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { Skeleton } from "@autolab/ui/components/skeleton";

export type UserVehicleFormValues = {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  bodyStyle: string;
  engine: string;
  engineVolume: number;
};

type InitialVehicle = {
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
};

type Props = {
  formId: string;
  onSubmit: (
    values: UserVehicleFormValues & { clientId?: string; newClient?: ClientFormValues },
  ) => void;
  initialVehicle?: InitialVehicle;
  initialClientId?: string;
  clients?: Array<{ id: string; label: string }>;
};

const buildVehicleFormSchema = (requireClient: boolean) =>
  z
    .object({
      makeId: z.string().min(1, "Марка обов'язкова"),
      modelId: z.string().min(1, "Модель обов'язкова"),
      licensePlate: z.string().min(1, "Державний номер обов'язковий"),
      vin: z.string(),
      year: z
        .number({ error: "Рік випуску обов'язковий" })
        .int()
        .min(1900, "Рік має бути не раніше 1900")
        .max(2100, "Рік має бути не пізніше 2100"),
      bodyStyleId: z.string().min(1, "Тип кузова обов'язковий"),
      engineId: z.string().min(1, "Тип двигуна обов'язковий"),
      engineVolume: z.union([z.string(), z.number()]).refine((value) => {
        const parsed = Number(value);
        return value !== "" && !Number.isNaN(parsed) && parsed > 0;
      }, "Об'єм двигуна обов'язковий"),
      clientId: z.string(),
      isCreatingClient: z.boolean(),
      clientFirstName: z.string(),
      clientLastName: z.string(),
      clientMiddleName: z.string(),
      clientPhone: z.string(),
    })
    .superRefine((data, ctx) => {
      if (!requireClient) return;

      if (data.isCreatingClient) {
        if (!data.clientFirstName.trim()) {
          ctx.addIssue({
            code: "custom",
            message: "Ім'я обов'язкове",
            path: ["clientFirstName"],
          });
        }
        return;
      }

      if (!data.clientId.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Клієнт обов'язковий",
          path: ["clientId"],
        });
      }
    });

export const UserVehicleForm = ({
  formId,
  onSubmit,
  initialVehicle,
  initialClientId,
  clients,
}: Props) => {
  const requireClient = clients !== undefined;
  const hasExistingClients = Boolean(clients?.length);
  const [makeId, setMakeId] = useState("");

  const clientOptions = useMemo(
    () => (clients ?? []).map((client) => ({ value: client.id, label: client.label })),
    [clients],
  );

  const { options: makeOptions, isLoading: isMakesLoading } = useVehicleMakes();
  const { options: modelOptions, isLoading: isModelsLoading } = useVehicleModels(makeId);

  const form = useForm({
    defaultValues: {
      makeId: "",
      modelId: "",
      licensePlate: initialVehicle?.licensePlate ?? "",
      vin: initialVehicle?.vin ?? "",
      year: initialVehicle?.year ?? new Date().getFullYear(),
      bodyStyleId: findOptionValueByLabel(initialVehicle?.bodyStyle, bodyStyleOptions),
      engineId: findOptionValueByLabel(initialVehicle?.engine, fuelOptions),
      engineVolume: initialVehicle?.engineVolume
        ? String(initialVehicle.engineVolume)
        : ("" as string | number),
      clientId: initialClientId ?? "",
      isCreatingClient: requireClient && !hasExistingClients && !initialClientId,
      clientFirstName: "",
      clientLastName: "",
      clientMiddleName: "",
      clientPhone: "",
    },
    validators: {
      onSubmit: buildVehicleFormSchema(requireClient),
    },
    onSubmit: async ({ value }) => {
      const make = resolveOptionLabel(value.makeId, makeOptions);
      const model = resolveOptionLabel(value.modelId, modelOptions);

      if (!make || !model) return;

      await onSubmit({
        make,
        model,
        year: value.year,
        licensePlate: value.licensePlate,
        vin: value.vin || undefined,
        bodyStyle: findOptionLabel(value.bodyStyleId, bodyStyleOptions) ?? "",
        engine: findOptionLabel(value.engineId, fuelOptions) ?? "",
        engineVolume: Number(value.engineVolume),
        clientId: value.isCreatingClient ? undefined : value.clientId || undefined,
        newClient: value.isCreatingClient
          ? {
              firstName: value.clientFirstName.trim(),
              lastName: value.clientLastName.trim() || undefined,
              middleName: value.clientMiddleName.trim() || undefined,
              phone: value.clientPhone.trim() || undefined,
            }
          : undefined,
      });
    },
  });

  const handleStartCreateClient = (query = "") => {
    const parsed = splitClientNameQuery(query);
    form.setFieldValue("isCreatingClient", true);
    form.setFieldValue("clientId", "");
    if (parsed.firstName) form.setFieldValue("clientFirstName", parsed.firstName);
    if (parsed.lastName) form.setFieldValue("clientLastName", parsed.lastName);
    if (parsed.middleName) form.setFieldValue("clientMiddleName", parsed.middleName);
  };

  const handleCancelCreateClient = () => {
    form.setFieldValue("isCreatingClient", false);
  };

  useEffect(() => {
    if (!initialVehicle || isMakesLoading) return;

    const nextMakeValue = resolveInitialOptionValue(initialVehicle.make, makeOptions);
    if (!nextMakeValue) return;

    setMakeId(isCustomOptionValue(nextMakeValue) ? "" : nextMakeValue);
    form.setFieldValue("makeId", nextMakeValue);
  }, [form, initialVehicle, isMakesLoading, makeOptions]);

  useEffect(() => {
    if (!initialVehicle) return;

    const currentMakeValue = form.getFieldValue("makeId");
    if (!currentMakeValue) return;

    if (isCustomOptionValue(currentMakeValue)) {
      form.setFieldValue("modelId", resolveInitialOptionValue(initialVehicle.model, []));
      return;
    }

    if (!makeId || isModelsLoading) return;

    form.setFieldValue("modelId", resolveInitialOptionValue(initialVehicle.model, modelOptions));
  }, [form, initialVehicle, makeId, isModelsLoading, modelOptions]);

  const handleMakeChange = (nextMakeValue: string) => {
    setMakeId(isCustomOptionValue(nextMakeValue) ? "" : nextMakeValue);
    form.setFieldValue("makeId", nextMakeValue);
    form.setFieldValue("modelId", "");
  };

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
        {requireClient ? (
          <form.Subscribe selector={(state) => state.values.isCreatingClient}>
            {(isCreatingClient) =>
              isCreatingClient ? (
                <div className="md:col-span-2 space-y-3 rounded-xl border border-border/60 bg-muted/15 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Новий клієнт</p>
                      <p className="text-xs text-muted-foreground">
                        Власника буде створено разом з автомобілем
                      </p>
                    </div>
                    {hasExistingClients ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCancelCreateClient}
                      >
                        Скасувати
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
                    <form.Field name="clientFirstName">
                      {(field) => (
                        <Input
                          autoFocus
                          label="Ім'я *"
                          placeholder="Іван"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          error={formatFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </form.Field>
                    <form.Field name="clientLastName">
                      {(field) => (
                        <Input
                          label="Прізвище"
                          placeholder="Іваненко"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                    <form.Field name="clientMiddleName">
                      {(field) => (
                        <Input
                          label="По батькові"
                          placeholder="Іванович"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                    <form.Field name="clientPhone">
                      {(field) => (
                        <Input
                          label="Номер телефону"
                          placeholder="+380 XX XXX XX XX"
                          type="tel"
                          inputMode="tel"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                  </div>
                </div>
              ) : (
                <form.Field name="clientId">
                  {(field) => (
                    <div className="md:col-span-2 space-y-2">
                      <SearchableSelect
                        label="Клієнт *"
                        placeholder="Оберіть клієнта"
                        searchPlaceholder="Пошук клієнта..."
                        emptyText="Клієнта не знайдено"
                        options={clientOptions}
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                        error={formatFieldErrors(field.state.meta.errors)}
                        action={{
                          label: (query) =>
                            query ? `Створити клієнта «${query}»` : "Додати нового клієнта",
                          onSelect: handleStartCreateClient,
                        }}
                      />
                      <button
                        type="button"
                        className="inline-flex self-end items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        onClick={() => handleStartCreateClient()}
                      >
                        <UserPlusIcon className="size-3.5" />
                        Додати клієнта
                      </button>
                    </div>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>
        ) : null}
        <form.Field name="licensePlate">
          {(field) => (
            <Input
              label="Державний номер *"
              placeholder="AA0000AA"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="vin">
          {(field) => (
            <Input
              label="VIN"
              placeholder="WVWZZZ3CZWE123456"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Field name="makeId">
          {(field) => (
            <SearchableSelect
              label="Марка *"
              placeholder="Оберіть або введіть марку"
              searchPlaceholder="Пошук марки..."
              options={makeOptions}
              value={field.state.value}
              onValueChange={(value) => handleMakeChange(value)}
              allowCustom
              isLoading={isMakesLoading}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.values.makeId}>
          {(selectedMakeId) => (
            <form.Field name="modelId">
              {(field) => (
                <SearchableSelect
                  label="Модель *"
                  placeholder={
                    selectedMakeId ? "Оберіть або введіть модель" : "Спочатку оберіть марку"
                  }
                  searchPlaceholder="Пошук моделі..."
                  options={modelOptions}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  allowCustom
                  disabled={!selectedMakeId}
                  isLoading={Boolean(makeId) && isModelsLoading}
                  error={formatFieldErrors(field.state.meta.errors)}
                />
              )}
            </form.Field>
          )}
        </form.Subscribe>
        <form.Field name="bodyStyleId">
          {(field) => (
            <SearchableSelect
              label="Тип кузова *"
              placeholder="Оберіть тип кузова"
              searchPlaceholder="Пошук типу кузова..."
              options={bodyStyleOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="year">
          {(field) => (
            <YearInput
              label="Рік випуску *"
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="engineId">
          {(field) => (
            <SearchableSelect
              label="Тип двигуна *"
              placeholder="Оберіть тип двигуна"
              searchPlaceholder="Пошук типу двигуна..."
              options={fuelOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="engineVolume">
          {(field) => (
            <Input
              label="Об'єм двигуна *"
              placeholder="2.0"
              type="number"
              step="0.1"
              inputMode="decimal"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>
    </form>
  );
};

export const UserVehicleFormSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {range(8).map((index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
  </div>
);
