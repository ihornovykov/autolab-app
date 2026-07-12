"use client";

import { cn } from "@autolab/ui/lib/utils";
import * as React from "react";
import { createPortal } from "react-dom";

type TooltipProviderProps = {
  children: React.ReactNode;
  delayDuration?: number;
};

const TooltipProvider = ({ children }: TooltipProviderProps) => <>{children}</>;

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
    }),
    [open],
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
};

type TooltipTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
};

const TooltipTrigger = ({ asChild = false, children }: TooltipTriggerProps) => {
  const context = React.useContext(TooltipContext);

  if (!context) return children;

  const eventHandlers = {
    onMouseEnter: () => context.setOpen(true),
    onMouseLeave: () => context.setOpen(false),
    onFocus: () => context.setOpen(true),
    onBlur: () => context.setOpen(false),
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;

    return React.cloneElement(child, {
      ...eventHandlers,
      ref: (node: HTMLElement | null) => {
        context.triggerRef.current = node;
      },
    } as Record<string, unknown>);
  }

  return (
    <span
      ref={(node) => {
        context.triggerRef.current = node;
      }}
      className="inline-flex"
      {...eventHandlers}
    >
      {children}
    </span>
  );
};

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "start" | "end";
  hidden?: boolean;
  sideOffset?: number;
};

const TooltipContent = ({
  className,
  side = "top",
  align = "center",
  hidden = false,
  sideOffset = 4,
  children,
  ...props
}: TooltipContentProps) => {
  const context = React.useContext(TooltipContext);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useLayoutEffect(() => {
    if (!context?.open || hidden || !context.triggerRef.current) return;

    const rect = context.triggerRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    if (side === "right") {
      top = rect.top + rect.height / 2;
      left = rect.right + sideOffset;
    } else if (side === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - sideOffset;
    } else if (side === "bottom") {
      top = rect.bottom + sideOffset;
      left = rect.left + rect.width / 2;
    } else {
      top = rect.top - sideOffset;
      left = rect.left + rect.width / 2;
    }

    if (align === "start") {
      if (side === "right" || side === "left") top = rect.top;
      else left = rect.left;
    } else if (align === "end") {
      if (side === "right" || side === "left") top = rect.bottom;
      else left = rect.right;
    }

    setPosition((previous) => {
      if (previous.top === top && previous.left === left) return previous;
      return { top, left };
    });
  }, [align, context?.open, hidden, side, sideOffset]);

  if (!context?.open || hidden) return null;

  const transform =
    side === "right"
      ? "translateY(-50%)"
      : side === "left"
        ? "translate(-100%, -50%)"
        : side === "bottom"
          ? "translateX(-50%)"
          : "translate(-50%, -100%)";

  return createPortal(
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none fixed z-50 overflow-hidden rounded-md border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className,
      )}
      style={{ top: position.top, left: position.left, transform }}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
