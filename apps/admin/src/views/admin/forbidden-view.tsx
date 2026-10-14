import { buttonVariants } from "@autolab/ui/components/button";

import { apiUrl } from "@/shared/lib/auth";
import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

export const ForbiddenView = () => (
  <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6">
    <ThemeSwitcher className="absolute top-8 right-8" />
    <Logo />
    <div className="max-w-md space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Немає доступу</h1>
      <p className="text-sm text-muted-foreground">
        Консоль доступна лише адміністраторам платформи. Сесія в Autolab залишається без змін.
      </p>
    </div>
    <a href={apiUrl} className={buttonVariants()}>
      Повернутися до Autolab
    </a>
  </div>
);
