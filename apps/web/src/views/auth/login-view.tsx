import { useState } from "react";

import { AuthDivider } from "@/features/auth/ui/auth-divider";
import { SignInForm } from "@/features/auth/ui/sign-in-form";
import { SignInWithGoogle } from "@/features/auth/ui/sign-in-with-google";
import { SignUpForm } from "@/features/auth/ui/sign-up-form";
import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

export const LoginView = () => {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left panel — image + gradient */}
      <div className="relative my-6 ml-6 hidden rounded-[12px] bg-muted bg-linear-to-b from-primary to-foreground/30 lg:block">
        <img
          src="/images/background.png"
          alt=""
          className="absolute inset-0 h-full w-full rounded-[12px] object-cover opacity-80 dark:brightness-75"
        />
        <img
          src="/icons/autolab.svg"
          alt="Autolab"
          width={32}
          height={32}
          className="relative m-4"
        />
      </div>

      {/* Right panel */}
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <ThemeSwitcher className="absolute top-8 right-8" />

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[350px]">
            {showSignIn ? (
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
                  <button
                    type="button"
                    className="underline underline-offset-4 cursor-pointer"
                    onClick={() => setShowSignIn(false)}
                  >
                    Зареєструватись
                  </button>
                </div>
              </div>
            ) : (
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
                  <button
                    type="button"
                    className="underline underline-offset-4 cursor-pointer"
                    onClick={() => setShowSignIn(true)}
                  >
                    Увійти
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
