import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/shared/lib/auth";
import { formatFieldErrors } from "@/shared/lib/errors";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
    newPassword: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
    confirmNewPassword: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Паролі не збігаються",
    path: ["confirmNewPassword"],
  });

type Props = {
  hasPassword: boolean;
};

export const ChangePasswordForm = ({ hasPassword }: Props) => {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            toast.success("Пароль змінено");
            form.reset();
          },
          onError: (error) => {
            toast.error(error.error.message || "Не вдалося змінити пароль");
          },
        },
      );
    },
    validators: {
      onSubmit: changePasswordSchema,
    },
  });

  if (!hasPassword) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Пароль</h3>
        <p className="text-sm text-muted-foreground">
          Ви увійшли через Google. Щоб встановити пароль, скористайтеся{" "}
          <Link to="/auth/forgot-password" className="underline underline-offset-4">
            сторінкою відновлення пароля
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <h3 className="text-sm font-medium">Зміна пароля</h3>
      <form.Field name="currentPassword">
        {(field) => (
          <Input
            label="Поточний пароль"
            type="password"
            password
            placeholder="Введіть поточний пароль"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="newPassword">
        {(field) => (
          <Input
            label="Новий пароль"
            type="password"
            password
            placeholder="Мінімум 8 символів"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="confirmNewPassword">
        {(field) => (
          <Input
            label="Підтвердження нового пароля"
            type="password"
            password
            placeholder="Повторіть новий пароль"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={formatFieldErrors(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" loading={isSubmitting} className="w-full">
            Змінити пароль
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
