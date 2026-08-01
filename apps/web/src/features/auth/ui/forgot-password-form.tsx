import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { getPasswordResetRedirectUrl } from "@/features/auth/lib/utils";
import { authClient } from "@/shared/lib/auth";
import { formatFieldErrors } from "@/shared/lib/errors";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";

export const ForgotPasswordForm = () => {
  const navigate = useNavigate({ from: "/auth/forgot-password" });

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: getPasswordResetRedirectUrl(),
        },
        {
          onSuccess: () => {
            toast.success("Якщо акаунт існує, ми надіслали лист із посиланням для відновлення пароля");
            navigate({ to: "/auth/sign-in" });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Невірна адреса email"),
      }),
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="m@example.com"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
        {({ canSubmit, isSubmitting }) => (
          <Button
            size="lg"
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            isLoading={isSubmitting}
            icon={<ArrowRight className="size-4" />}
          >
            Надіслати посилання
          </Button>
        )}
      </form.Subscribe>
      <div className="text-center text-sm">
        <Link to="/auth/sign-in" className="underline underline-offset-4">
          Повернутись до входу
        </Link>
      </div>
    </form>
  );
};
