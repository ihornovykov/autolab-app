import type { ReactNode } from "react";

import { AuthPageAside } from "@/shared/ui/auth-page-aside";
import { Logo } from "@/shared/ui/logo";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  children: ReactNode;
  contentClassName?: string;
  contentAlign?: "center" | "start";
  fixedHeight?: boolean;
};

export const AuthPageShell = ({
  children,
  contentClassName = "max-w-[350px]",
  contentAlign = "center",
  fixedHeight = false,
}: Props) => (
  <div
    className={cn(
      "grid min-h-0 lg:grid-cols-2",
      fixedHeight ? "h-svh max-h-svh overflow-hidden" : "min-h-svh",
    )}
  >
    <div
      className={cn(
        "relative hidden overflow-hidden rounded-[12px] bg-muted bg-linear-to-b from-primary to-foreground/30 lg:block",
        fixedHeight ? "m-6 ml-6 min-h-0" : "my-6 ml-6",
      )}
    >
      <AuthPageAside />
    </div>

    <div
      className={cn(
        "relative flex min-h-0 flex-col gap-4 p-6 md:p-10",
        fixedHeight && "h-full overflow-hidden",
      )}
    >
      <div className="flex shrink-0 items-center justify-center gap-2 md:justify-start">
        <Logo />
      </div>
      <ThemeSwitcher className="absolute top-8 right-8" />

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          contentAlign === "center" && !fixedHeight && "items-center justify-center py-4",
          contentAlign === "start" && !fixedHeight && "items-start justify-center py-4",
        )}
      >
        <div
          className={cn(
            "w-full",
            fixedHeight && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  </div>
);
