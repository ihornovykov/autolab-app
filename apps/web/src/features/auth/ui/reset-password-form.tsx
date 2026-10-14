import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/shared/lib/auth";
import { formatFieldErrors } from "@/shared/lib/errors";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";

type Props = {
  token: string;
};

export const ResetPasswordForm = ({ token }: Props) => {
  const navigate = useNavigate({ from: "/auth/reset-password" });

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      await authClient.resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onSuccess: () => {
            toast.success("Пароль успішно змінено");
            navigate({ to: "/auth/sign-in" });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          password: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Паролі не співпадають",
          path: ["confirmPassword"],
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
      <form.Field name="password">
        {(field) => (
          <Input
            id="password"
            label="Новий пароль"
            type="password"
            password
            placeholder="Мінімум 8 символів"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="confirmPassword">
        {(field) => (
          <Input
            id="confirmPassword"
            label="Підтвердження паролю"
            type="password"
            password
            placeholder="Повторіть новий пароль"
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
            Зберегти пароль
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
