import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { clearAuthContextCache } from "@/features/auth/lib/auth-context-cache";
import {
  onboardingProfileSchema,
  type OnboardingProfileValues,
} from "@/features/onboarding/lib/onboarding-profile-schema";
import { orpc } from "@/shared/api/orpc";
import { formatFieldErrors } from "@/shared/lib/format-field-errors";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";

type Props = {
  initialValues: OnboardingProfileValues;
  onCompleted: () => void;
};

export const OnboardingProfileForm = ({ initialValues, onCompleted }: Props) => {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation(
    orpc.profile.updateProfile.mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося зберегти профіль");
      },
    }),
  );

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      await updateProfileMutation.mutateAsync({
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        middleName: value.middleName.trim() || undefined,
        phone: value.phone.trim(),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orpc.profile.key() }),
        queryClient.invalidateQueries({ queryKey: orpc.profile.getOnboardingStatus.key() }),
      ]);

      clearAuthContextCache();

      toast.success("Профіль збережено");
      onCompleted();
    },
    validators: {
      onChange: onboardingProfileSchema,
      onSubmit: onboardingProfileSchema,
    },
  });

  const isSaving = updateProfileMutation.isPending;

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state) => ({
          hasAttemptedSubmit: state.submissionAttempts > 0,
          isValid: state.isValid,
        })}
      >
        {({ hasAttemptedSubmit, isValid }) =>
          hasAttemptedSubmit && !isValid ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Заповніть усі обов&apos;язкові поля перед продовженням
            </p>
          ) : null
        }
      </form.Subscribe>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form.Field name="firstName">
          {(field) => (
            <Input
              label="Ім'я *"
              placeholder="Олександр"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="lastName">
          {(field) => (
            <Input
              label="Прізвище *"
              placeholder="Коваленко"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="middleName">
          {(field) => (
            <Input
              label="По батькові"
              placeholder="Петрович"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(field) => (
            <Input
              label="Телефон *"
              type="tel"
              placeholder="+380 67 123 45 67"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={isSaving}
        icon={<ArrowRight className="size-4" />}
      >
        Продовжити
      </Button>
    </form>
  );
};
