import { Link } from "@tanstack/react-router";

import { AuthDivider } from "@/features/auth/ui/auth-divider";
import { SignInWithGoogle } from "@/features/auth/ui/sign-in-with-google";
import { SignUpForm } from "@/features/auth/ui/sign-up-form";
import { AuthPageShell } from "@/views/auth/auth-page-shell";

export const SignUpView = () => (
  <AuthPageShell>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Реєстрація</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Введіть дані користувача та пароль
        </p>
      </div>
      <div className="grid gap-6">
        <SignUpForm />
        <AuthDivider />
        <SignInWithGoogle />
      </div>
      <div className="text-center text-sm">
        Вже маєте аккаунт?{" "}
        <Link to="/auth/sign-in" className="underline underline-offset-4">
          Увійти
        </Link>
      </div>
    </div>
  </AuthPageShell>
);
