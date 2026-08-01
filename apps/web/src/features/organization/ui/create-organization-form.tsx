import { useForm } from "@tanstack/react-form";
import { Building2, MapPin } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import z from "zod";

const CreateOrganizationMap = lazy(() =>
  import("@/features/organization/ui/create-organization-map").then((module) => ({
    default: module.CreateOrganizationMap,
  })),
);
import { LogoUpload } from "@/features/organization/ui/logo-upload";
import { formatFieldErrors } from "@/shared/lib/errors";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import { Separator } from "@autolab/ui/components/separator";
import { Textarea } from "@autolab/ui/components/textarea";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Назва організації обов'язкова"),
  description: z.string(),
  address: z.string(),
  latitude: z.union([z.number(), z.undefined()]),
  longitude: z.union([z.number(), z.undefined()]),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
});

type CreateOrganizationFormValues = z.input<typeof createOrganizationSchema>;

type InitialOrganization = {
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  logo?: string | null;
};

const getDefaultValues = (
  initialOrganization?: InitialOrganization,
): CreateOrganizationFormValues => ({
  name: initialOrganization?.name ?? "",
  description: initialOrganization?.description ?? "",
  address: initialOrganization?.address ?? "",
  latitude: initialOrganization?.latitude ?? undefined,
  longitude: initialOrganization?.longitude ?? undefined,
  phone: initialOrganization?.phone ?? "",
  email: initialOrganization?.email ?? "",
  website: initialOrganization?.website ?? "",
});

type Props = {
  formId: string;
  initialOrganization?: InitialOrganization;
  onSubmit: (values: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
};

const SectionHeading = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Building2;
  title: string;
  description?: string;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
  </div>
);

export const CreateOrganizationForm = ({ formId, initialOrganization, onSubmit }: Props) => {
  const [, setLogoFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: getDefaultValues(initialOrganization),
    onSubmit: async ({ value }) => {
      onSubmit({
        name: value.name,
        description: value.description || undefined,
        address: value.address || undefined,
        phone: value.phone || undefined,
        email: value.email || undefined,
        website: value.website || undefined,
        latitude: value.latitude,
        longitude: value.longitude,
      });
    },
    validators: {
      onSubmit: createOrganizationSchema,
    },
  });

  const handleLocationSelect = (lat: number, lng: number, selectedAddress: string) => {
    form.setFieldValue("latitude", lat);
    form.setFieldValue("longitude", lng);
    form.setFieldValue("address", selectedAddress);
  };

  return (
    <form
      id={formId}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state) => ({
          hasAttemptedSubmit: state.submissionAttempts > 0,
          canSubmit: state.canSubmit,
        })}
      >
        {({ hasAttemptedSubmit, canSubmit }) =>
          hasAttemptedSubmit && !canSubmit ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Заповніть усі обов&apos;язкові поля перед збереженням
            </p>
          ) : null
        }
      </form.Subscribe>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <SectionHeading
            icon={Building2}
            title="Основна інформація"
            description="Логотип та контактні дані організації"
          />

          <LogoUpload initialLogo={initialOrganization?.logo} onLogoChange={setLogoFile} />

          <form.Field name="name">
            {(field) => (
              <Input
                label="Назва *"
                placeholder="Наприклад, AutoLab СТО"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={formatFieldErrors(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="phone">
              {(field) => (
                <Input
                  label="Телефон"
                  placeholder="+380 67 123 45 67"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={formatFieldErrors(field.state.meta.errors)}
                />
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <Input
                  type="email"
                  label="Email"
                  placeholder="info@autolab.ua"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={formatFieldErrors(field.state.meta.errors)}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="website">
            {(field) => (
              <Input
                type="url"
                label="Веб-сайт"
                placeholder="https://autolab.ua"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={formatFieldErrors(field.state.meta.errors)}
              />
            )}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeading
            icon={MapPin}
            title="Розташування"
            description="Оберіть точку на карті — адресу заповнимо автоматично"
          />

          <div className="space-y-2">
            <Label>Адреса на карті</Label>
            <Suspense
              fallback={
                <div className="h-[220px] animate-pulse rounded-lg border border-input bg-muted/40" />
              }
            >
              <CreateOrganizationMap
                initialLocation={
                  initialOrganization?.latitude != null && initialOrganization?.longitude != null
                    ? {
                        lat: initialOrganization.latitude,
                        lng: initialOrganization.longitude,
                      }
                    : undefined
                }
                onLocationSelect={handleLocationSelect}
                className="h-[220px] overflow-hidden rounded-lg border border-input shadow-sm"
              />
            </Suspense>
            <form.Field name="address">
              {(field) => (
                <p
                  className="min-h-10 rounded-md bg-muted/40 px-3 py-2 text-center text-sm leading-snug text-muted-foreground"
                  title={field.state.value || undefined}
                >
                  {field.state.value || "Клікніть на карту, щоб обрати адресу"}
                </p>
              )}
            </form.Field>
          </div>

          <Separator />

          <form.Field name="description">
            {(field) => (
              <Textarea
                label="Опис"
                placeholder="Короткий опис вашої організації та послуг"
                className="min-h-28 resize-none"
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
