import { useForm } from "@tanstack/react-form";
import z from "zod";

import { formatFieldErrors } from "@/shared/lib/format-field-errors";
import { Input } from "@autolab/ui/components/input";

export type ClientFormValues = {
  firstName: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
};

type Props = {
  formId: string;
  initialValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => void;
};

const clientFormSchema = z.object({
  firstName: z.string().trim().min(1, "Ім'я обов'язкове"),
  lastName: z.string(),
  middleName: z.string(),
  phone: z.string(),
});

const toSubmitValues = (value: z.infer<typeof clientFormSchema>): ClientFormValues => ({
  firstName: value.firstName.trim(),
  lastName: value.lastName.trim() || undefined,
  middleName: value.middleName.trim() || undefined,
  phone: value.phone.trim() || undefined,
});

export const ClientForm = ({ formId, initialValues, onSubmit }: Props) => {
  const form = useForm({
    defaultValues: {
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      middleName: initialValues?.middleName ?? "",
      phone: initialValues?.phone ?? "",
    },
    validators: {
      onSubmit: clientFormSchema,
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
          <p className="text-sm font-medium">Особисті дані</p>
          <p className="text-xs text-muted-foreground">
            Вкажіть ім&apos;я, прізвище та контактний телефон клієнта
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-3 gap-y-4 md:grid-cols-2">
          <form.Field name="firstName">
            {(field) => (
              <Input
                label="Ім'я *"
                placeholder="Іван"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={formatFieldErrors(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field name="lastName">
            {(field) => (
              <Input
                label="Прізвище"
                placeholder="Іваненко"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="middleName">
            {(field) => (
              <Input
                label="По батькові"
                placeholder="Іванович"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="phone">
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
    </form>
  );
};
