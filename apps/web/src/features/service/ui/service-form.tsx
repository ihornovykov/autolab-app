import { useForm } from "@tanstack/react-form";
import z from "zod";

import { SERVICE_CATEGORIES } from "@/features/service/lib/service-categories";
import { formatFieldErrors } from "@/shared/lib/errors";
import { Input } from "@autolab/ui/components/input";
import { Textarea } from "@autolab/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";

export type ServiceFormValues = {
  category?: string;
  title: string;
  description?: string;
  price: string;
  duration: number;
};

type Props = {
  formId: string;
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => void;
};

const serviceFormSchema = z.object({
  category: z.string().trim().min(1, "Категорія обов'язкова"),
  title: z.string().trim().min(1, "Назва обов'язкова"),
  description: z.string(),
  price: z
    .string()
    .trim()
    .min(1, "Ціна обов'язкова")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, "Некоректна ціна"),
  duration: z.union([z.string(), z.number()]).refine((value) => {
    const parsed = Number(value);
    return value !== "" && !Number.isNaN(parsed) && Number.isInteger(parsed) && parsed > 0;
  }, "Тривалість має бути більше 0"),
});

const toSubmitValues = (value: z.infer<typeof serviceFormSchema>): ServiceFormValues => ({
  category: value.category.trim() || undefined,
  title: value.title.trim(),
  description: value.description.trim() || undefined,
  price: value.price.trim(),
  duration: Number(value.duration),
});

export const ServiceForm = ({ formId, initialValues, onSubmit }: Props) => {
  const form = useForm({
    defaultValues: {
      category: initialValues?.category ?? "",
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price ?? "",
      duration: initialValues?.duration ? String(initialValues.duration) : ("" as string | number),
    },
    validators: {
      onSubmit: serviceFormSchema,
    },
    onSubmit: async ({ value }) => onSubmit(toSubmitValues(value)),
  });

  return (
    <form
      id={formId}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <p className="text-sm font-medium">Основна інформація</p>
          <p className="text-xs text-muted-foreground">Назва та опис послуги для прайс-листа</p>
        </div>

        <form.Field name="category">
          {(field) => (
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Категорія</label>
              <Select
                value={field.state.value || null}
                onValueChange={(value) => field.handleChange(value ?? "")}
                items={SERVICE_CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="title">
          {(field) => (
            <Input
              label="Назва *"
              placeholder="Заміна оливи та фільтра"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Textarea
              label="Опис"
              placeholder="Короткий опис робіт"
              className="min-h-24 resize-none"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div>
          <p className="text-sm font-medium">Вартість і час</p>
          <p className="text-xs text-muted-foreground">
            Ціна для клієнта та орієнтовна тривалість виконання
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field name="price">
            {(field) => (
              <Input
                label="Ціна (₴) *"
                placeholder="800"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={formatFieldErrors(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field name="duration">
            {(field) => (
              <Input
                label="Тривалість (хв) *"
                placeholder="60"
                type="number"
                inputMode="numeric"
                min="1"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={formatFieldErrors(field.state.meta.errors)}
              />
            )}
          </form.Field>
        </div>
      </div>
    </form>
  );
};
