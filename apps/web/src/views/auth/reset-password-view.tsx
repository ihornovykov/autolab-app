import { Link } from "@tanstack/react-router";

import { ResetPasswordForm } from "@/features/auth/ui/reset-password-form";
import { AuthPageShell } from "@/views/auth/auth-page-shell";

type Props = {
  token?: string;
  error?: string;
};

export const ResetPasswordView = ({ token, error }: Props) => (
  <AuthPageShell>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Новий пароль</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Створіть новий пароль для вашого акаунту
        </p>
      </div>

      {error || !token ? (
        <div className="space-y-4 text-center text-sm">
          <p className="text-muted-foreground">
            Посилання для відновлення пароля недійсне або прострочене.
          </p>
          <Link to="/auth/forgot-password" className="underline underline-offset-4">
            Запросити нове посилання
          </Link>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </div>
  </AuthPageShell>
);
