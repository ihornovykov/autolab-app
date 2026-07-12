import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import z from "zod";

import {
  bodyStyleOptions,
  fuelOptions,
  useVehicleMakes,
  useVehicleModels,
} from "@/features/vehicle/lib/use-vehicle-catalog";
import { findOptionLabel, findOptionValueByLabel } from "@/features/vehicle/lib/utils";
import { range } from "@/shared/lib/arrays";
import { formatFieldErrors } from "@/shared/lib/format-field-errors";
import { SearchableSelect } from "@/shared/ui/searchable-select";
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
  onSubmit: (values: UserVehicleFormValues & { clientId?: string }) => void;
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
    })
    .superRefine((data, ctx) => {
      if (requireClient && !data.clientId.trim()) {
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
  const requireClient = Boolean(clients?.length);
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
    },
    validators: {
      onSubmit: buildVehicleFormSchema(requireClient),
    },
    onSubmit: async ({ value }) => {
      const make = findOptionLabel(value.makeId, makeOptions);
      const model = findOptionLabel(value.modelId, modelOptions);

      if (!make || !model) return;

      onSubmit({
        make,
        model,
        year: value.year,
        licensePlate: value.licensePlate,
        vin: value.vin || undefined,
        bodyStyle: findOptionLabel(value.bodyStyleId, bodyStyleOptions) ?? "",
        engine: findOptionLabel(value.engineId, fuelOptions) ?? "",
        engineVolume: Number(value.engineVolume),
        clientId: value.clientId || undefined,
      });
    },
  });

  useEffect(() => {
    if (!initialVehicle || isMakesLoading || makeOptions.length === 0) return;

    const nextMakeId = findOptionValueByLabel(initialVehicle.make, makeOptions);
    if (nextMakeId) {
      setMakeId(nextMakeId);
      form.setFieldValue("makeId", nextMakeId);
    }
  }, [form, initialVehicle, isMakesLoading, makeOptions]);

  useEffect(() => {
    if (!initialVehicle || !makeId || isModelsLoading || modelOptions.length === 0) return;

    const nextModelId = findOptionValueByLabel(initialVehicle.model, modelOptions);
    if (nextModelId) form.setFieldValue("modelId", nextModelId);
  }, [form, initialVehicle, makeId, isModelsLoading, modelOptions]);

  const handleMakeChange = (nextMakeId: string) => {
    setMakeId(nextMakeId);
    form.setFieldValue("makeId", nextMakeId);
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
          <form.Field name="clientId">
            {(field) => (
              <div className="md:col-span-2">
                <SearchableSelect
                  label="Клієнт *"
                  placeholder="Оберіть клієнта"
                  searchPlaceholder="Пошук клієнта..."
                  options={clientOptions}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  error={formatFieldErrors(field.state.meta.errors)}
                />
              </div>
            )}
          </form.Field>
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
              placeholder="Оберіть марку"
              searchPlaceholder="Пошук марки..."
              options={makeOptions}
              value={makeId}
              onValueChange={(value) => handleMakeChange(value)}
              isLoading={isMakesLoading}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="modelId">
          {(field) => (
            <SearchableSelect
              label="Модель *"
              placeholder={makeId ? "Оберіть модель" : "Спочатку оберіть марку"}
              searchPlaceholder="Пошук моделі..."
              options={modelOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              disabled={!makeId}
              isLoading={isModelsLoading}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
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
            <Input
              label="Рік випуску *"
              placeholder="2020"
              type="number"
              inputMode="numeric"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
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
