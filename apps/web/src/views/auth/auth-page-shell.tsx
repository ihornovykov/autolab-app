import type { ReactNode } from "react";

import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  children: ReactNode;
  contentClassName?: string;
  contentAlign?: "center" | "start";
};

export const AuthPageShell = ({
  children,
  contentClassName = "max-w-[350px]",
  contentAlign = "center",
}: Props) => (
  <div className="grid min-h-svh lg:grid-cols-2">
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

    <div className="relative flex flex-col gap-4 p-6 md:p-10">
      <div className="flex items-center justify-center gap-2 md:justify-start">
        <Logo />
      </div>
      <ThemeSwitcher className="absolute top-8 right-8" />

      <div
        className={cn(
          "flex flex-1",
          contentAlign === "center" ? "items-center justify-center" : "items-start justify-center py-4",
        )}
      >
        <div className={cn("w-full", contentClassName)}>{children}</div>
      </div>
    </div>
  </div>
);
