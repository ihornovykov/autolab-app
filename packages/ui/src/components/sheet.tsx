"use client";

import { cn } from "@autolab/ui/lib/utils";
import { XIcon } from "lucide-react";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "top" | "bottom" | "left" | "right";
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  style?: React.CSSProperties;
};

const sheetSideClasses = {
  top: "inset-x-0 top-0 h-auto max-h-[90vh] border-b",
  bottom: "inset-x-0 bottom-0 h-auto max-h-[90vh] border-t",
  left: "inset-y-0 left-0 h-full w-full border-r sm:max-w-md",
  right: "inset-y-0 right-0 h-full w-full border-l sm:max-w-md",
} as const;

export const Sheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  contentClassName,
  side = "right",
  footer,
  showCloseButton = true,
  style,
}: SheetProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" data-state="open">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-black/80 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <aside
        data-state="open"
        style={style}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-background shadow-lg transition ease-in-out duration-300",
          side === "left" && "animate-in slide-in-from-left",
          side === "right" && "animate-in slide-in-from-right",
          side === "top" && "animate-in slide-in-from-top",
          side === "bottom" && "animate-in slide-in-from-bottom",
          sheetSideClasses[side],
          className,
        )}
      >
        {showCloseButton ? (
          <button
            type="button"
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        ) : null}
        {title || description ? (
          <div className="shrink-0 space-y-1.5 border-b px-6 pb-4 pt-6 pr-12">
            {title ? (
              <h2 className="text-xl font-semibold leading-none tracking-tight">{title}</h2>
            ) : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
        ) : null}
        <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", contentClassName)}>
          {children}
        </div>
        {footer ? <div className="shrink-0 border-t bg-muted/20 px-6 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
};

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
};

export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  footer,
}: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-black/80 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-lg translate-y-0 flex-col overflow-hidden rounded-xl border bg-background shadow-lg duration-200 animate-in fade-in-0 zoom-in-95",
          className,
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-10 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => onOpenChange(false)}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {title || description ? (
          <div className="shrink-0 space-y-1.5 border-b px-6 pb-4 pt-6 pr-12">
            {title ? (
              <h2 className="text-xl font-semibold leading-none tracking-tight">{title}</h2>
            ) : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="shrink-0 border-t bg-muted/20 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
};

export const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

export const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);

export const DialogHeader = SheetHeader;
export const DialogFooter = SheetFooter;
