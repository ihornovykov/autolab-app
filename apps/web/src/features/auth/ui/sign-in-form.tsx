import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { clearAuthContextCache } from "@/features/auth/lib/utils";
import { authClient } from "@/shared/lib/auth";
import { formatFieldErrors } from "@/shared/lib/errors";

export const SignInForm = () => {
  const navigate = useNavigate({ from: "/auth/sign-in" });

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            clearAuthContextCache();
            navigate({ to: "/dashboard" });
            toast.success("Ви успішно увійшли");
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
        password: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
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
      <form.Field name="email">
        {(field) => (
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="m@example.com"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <div className="grid gap-1">
        <div className="flex items-center">
          <Label htmlFor="password">Пароль</Label>
          <Link
            to="/auth/forgot-password"
            className="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Забули пароль?
          </Link>
        </div>
        <form.Field name="password">
          {(field) => (
            <Input
              id="password"
              type="password"
              password
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>
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
            Увійти
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
