import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

import { connectedAccountsQueryKey } from "@/features/account/hooks/use-connected-accounts";
import { orpc } from "@/shared/api/orpc";
import { formatFieldErrors } from "@/shared/lib/errors";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Input } from "@autolab/ui/components/input";

const linkEmailAccountSchema = z
  .object({
    newPassword: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
    confirmNewPassword: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Паролі не збігаються",
    path: ["confirmNewPassword"],
  });

const FORM_ID = "link-email-account-form";

type Props = {
  email: string;
};

export const LinkEmailAccountDialog = ({ email }: Props) => {
  const queryClient = useQueryClient();

  const linkEmailMutation = useMutation(
    orpc.profile.linkEmailAccount.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.profile.key() });
        await queryClient.invalidateQueries({ queryKey: connectedAccountsQueryKey });
        toast.success("Email і пароль підключено");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося підключити email");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    onSubmit: async ({ value }) => {
      await linkEmailMutation.mutateAsync({ newPassword: value.newPassword });
    },
    validators: {
      onSubmit: linkEmailAccountSchema,
    },
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Підключити email і пароль"
      description="Встановіть пароль для входу за email. Адреса залишиться поточною."
      className="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogs.close()}
            disabled={linkEmailMutation.isPending}
          >
            Скасувати
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" form={FORM_ID} loading={isSubmitting}>
                Підключити
              </Button>
            )}
          </form.Subscribe>
        </div>
      }
    >
      <form
        id={FORM_ID}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <Input label="Email" type="email" value={email} disabled readOnly />
        <form.Field name="newPassword">
          {(field) => (
            <Input
              label="Пароль"
              type="password"
              password
              placeholder="Мінімум 8 символів"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field name="confirmNewPassword">
          {(field) => (
            <Input
              label="Підтвердження пароля"
              type="password"
              password
              placeholder="Повторіть пароль"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              error={formatFieldErrors(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </form>
    </Dialog>
  );
};
