import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { authClient, isPlatformAdmin } from "@/shared/lib/auth";
import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

export const SignInView = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await authClient.signIn.email({ email, password });
    setIsSubmitting(false);
    if (result.error) {
      setError("Невірна адреса email або пароль.");
      return;
    }
    const session = await authClient.getSession();
    if (!isPlatformAdmin(session.data?.user.role)) {
      await navigate({ to: "/forbidden" });
      return;
    }
    await navigate({ to: "/overview" });
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative m-0 hidden overflow-hidden bg-muted lg:m-6 lg:block lg:rounded-[12px]">
        <img
          src="/images/background.png"
          alt=""
          className="absolute inset-0 h-full w-full rounded-[12px] object-cover opacity-90 dark:brightness-75"
        />
        <div className="absolute inset-0 rounded-[12px] bg-linear-to-t from-black/80 via-black/45 to-black/15" />
        <div className="absolute inset-0 rounded-[12px] bg-linear-to-tl from-primary/10 via-primary/25 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
          <Logo variant="inverse" />
          <div className="max-w-sm space-y-2">
            <p className="text-2xl font-semibold tracking-tight">Консоль платформи</p>
            <p className="text-sm text-white/80">
              Перегляд організацій, користувачів і записів. Вхід лише для адміністраторів.
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center md:justify-start">
          <Logo />
        </div>
        <ThemeSwitcher className="absolute top-8 right-8" />
        <div className="flex flex-1 items-center justify-center py-4">
          <form onSubmit={onSubmit} className="grid w-full max-w-[350px] gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Вхід</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Введіть дані адміністратора платформи
              </p>
            </div>
            <div className="grid gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Input
                id="password"
                label="Пароль"
                type="password"
                password
                placeholder="Мінімум 8 символів"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={error ?? undefined}
                required
              />
              <Button
                size="lg"
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                icon={<ArrowRight className="size-4" />}
              >
                Увійти
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
