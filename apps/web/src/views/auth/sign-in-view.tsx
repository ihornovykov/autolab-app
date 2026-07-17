import { Link } from "@tanstack/react-router";

import { AuthDivider } from "@/features/auth/ui/auth-divider";
import { SignInForm } from "@/features/auth/ui/sign-in-form";
import { SignInWithGoogle } from "@/features/auth/ui/sign-in-with-google";
import { AuthPageShell } from "@/views/auth/auth-page-shell";

export const SignInView = () => (
  <AuthPageShell>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Вхід</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Введіть дані користувача та пароль
        </p>
      </div>
      <div className="grid gap-6">
        <SignInForm />
        <AuthDivider />
        <SignInWithGoogle />
      </div>
      <div className="text-center text-sm">
        Не маєте аккаунту?{" "}
        <Link to="/auth/sign-up" className="underline underline-offset-4">
          Зареєструватись
        </Link>
      </div>
    </div>
  </AuthPageShell>
);
