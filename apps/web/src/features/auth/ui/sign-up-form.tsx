import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/shared/lib/auth";
import { formatFieldErrors } from "@/shared/lib/errors";

export const SignUpForm = () => {
  const navigate = useNavigate({ from: "/auth/sign-up" });

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        { name: value.name, email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate({ to: "/onboarding" });
            toast.success("Ви успішно зареєструвались!");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Ім'я є обов'язковим"),
        email: z.email("Невірна адреса email"),
        password: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
        confirmPassword: z.string(),
      }).refine((d) => d.password === d.confirmPassword, {
        message: "Паролі не співпадають",
        path: ["confirmPassword"],
      }),
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Input
            id="name"
            label="Ім'я"
            type="text"
            placeholder="Іван Іваненко"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="email">
        {(field) => (
          <Input
            id="email"
            label="Електронна пошта"
            type="email"
            placeholder="m@example.com"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <Input
            id="password"
            label="Пароль"
            type="password"
            password
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
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
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
        {({ canSubmit, isSubmitting }) => (
          <Button
            size="lg"
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            isLoading={isSubmitting}
            icon={<ArrowRight className="size-4" />}
          >
            Реєстрація
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
