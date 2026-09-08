import { useMutation } from "@tanstack/react-query";
import { LinkIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { client } from "@/shared/api/orpc";
import { Button } from "@autolab/ui/components/button";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  organizationId: string;
  bookingId: string;
};

const COPIED_RESET_MS = 2200;

const AnimatedCheckIcon = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      return;
    }

    path.animate([{ strokeDashoffset: 22 }, { strokeDashoffset: 0 }], {
      duration: 420,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    });
  }, []);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 translate-y-px"
      aria-hidden
    >
      <path ref={pathRef} d="M20 6 9 17l-5-5" strokeDasharray={22} strokeDashoffset={22} />
    </svg>
  );
};

export const CopyBookingLinkButton = ({ organizationId, bookingId }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimeoutRef = useRef<number>(0);

  const copyMutation = useMutation({
    mutationFn: () => client.booking.createBookingShareToken({ organizationId, bookingId }),
    onSuccess: async ({ url }) => {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        toast.error("Не вдалося скопіювати посилання");
        return;
      }

      window.clearTimeout(resetTimeoutRef.current);
      setIsCopied(true);
      resetTimeoutRef.current = window.setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
      toast.success("Посилання скопійовано");
    },
    onError: () => {
      toast.error("Не вдалося скопіювати посилання");
    },
  });

  useEffect(
    () => () => {
      window.clearTimeout(resetTimeoutRef.current);
    },
    [],
  );

  const isPending = copyMutation.isPending;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn(
        "sm:h-9 sm:w-auto sm:px-4",
        "transition-[color,background-color,border-color,box-shadow] duration-300",
        isCopied &&
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400",
      )}
      icon={
        <span className="relative grid size-4 place-items-center">
          <LinkIcon
            className={cn(
              "col-start-1 row-start-1 transition-all duration-200",
              isPending || isCopied ? "scale-50 opacity-0" : "scale-100 opacity-100",
            )}
          />
          {isPending ? <Loader2 className="col-start-1 row-start-1 animate-spin" /> : null}
          {isCopied && !isPending ? (
            <span className="col-start-1 row-start-1 grid place-items-center">
              <AnimatedCheckIcon />
            </span>
          ) : null}
        </span>
      }
      aria-label={isCopied ? "Скопійовано" : "Копіювати посилання"}
      disabled={isPending}
      onClick={() => copyMutation.mutate()}
    >
      <span aria-hidden className="relative hidden justify-items-start sm:inline-grid">
        <span
          className={cn(
            "col-start-1 row-start-1 transition-all duration-300",
            isCopied ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          Копіювати посилання
        </span>
        <span
          className={cn(
            "col-start-1 row-start-1 transition-all duration-300",
            isCopied ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
          )}
        >
          Скопійовано
        </span>
      </span>
    </Button>
  );
};
