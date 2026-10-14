import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { toast } from "sonner";

import { range } from "@/shared/lib/arrays";
import { orpc } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { Skeleton } from "@autolab/ui/components/skeleton";

type Profile = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  email: string;
  hasPassword: boolean;
};

type Props = {
  profile: Profile;
};

const buildFormValues = (profile: Profile) => ({
  firstName: profile.firstName ?? "",
  lastName: profile.lastName ?? "",
  middleName: profile.middleName ?? "",
  phone: profile.phone ?? "",
  email: profile.email,
});

export const ProfileForm = ({ profile }: Props) => {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation(
    orpc.profile.updateProfile.mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити профіль");
      },
    }),
  );

  const isSaving = updateProfileMutation.isPending;

  const form = useForm({
    defaultValues: buildFormValues(profile),
    onSubmit: async ({ value }) => {
      await updateProfileMutation.mutateAsync({
        firstName: value.firstName || undefined,
        lastName: value.lastName || undefined,
        middleName: value.middleName || undefined,
        phone: value.phone || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: orpc.profile.key() });
      toast.success("Дані збережено");
    },
  });

  useEffect(() => {
    form.reset(buildFormValues(profile));
  }, [profile]);

  return (
    <form
      className="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form.Field name="firstName">
          {(field) => (
            <Input
              label="Ім'я"
              placeholder="Олександр"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Field name="lastName">
          {(field) => (
            <Input
              label="Прізвище"
              placeholder="Коваленко"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Field name="middleName">
          {(field) => (
            <Input
              label="По батькові"
              placeholder="Петрович"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(field) => (
            <Input
              label="Телефон"
              type="tel"
              placeholder="+380 67 123 45 67"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={field.state.value}
              disabled
              readOnly
            />
          )}
        </form.Field>
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <Button type="submit" loading={isSaving}>
          Зберегти зміни
        </Button>
      </div>
    </form>
  );
};

export const ProfileFormSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {range(5).map((index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
  </div>
);
