import { ForgotPasswordForm } from "@/features/auth/ui/forgot-password-form";
import { AuthPageShell } from "@/views/auth/auth-page-shell";

export const ForgotPasswordView = () => (
  <AuthPageShell>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Відновлення пароля</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Введіть email, і ми надішлемо посилання для створення нового пароля
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  </AuthPageShell>
);
