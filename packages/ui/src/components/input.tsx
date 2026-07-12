import { Button } from "@autolab/ui/components/button";
import { Label } from "@autolab/ui/components/label";
import { cn } from "@autolab/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState } from "react";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
  password?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, password, id, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="space-y-1">
        {label ? <Label htmlFor={id}>{label}</Label> : null}
        <div className="relative">
          <input
            id={id}
            type={password && isVisible ? "text" : password ? "password" : type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              password ? "pe-9" : "",
              className,
            )}
            ref={ref}
            {...props}
          />
          {password ? (
            <Button
              size="icon"
              variant="link"
              className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              type="button"
              onClick={() => setIsVisible((prev) => !prev)}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
            >
              {isVisible ? (
                <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </Button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
