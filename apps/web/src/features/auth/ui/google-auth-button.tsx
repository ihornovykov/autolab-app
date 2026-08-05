import { Button } from "@autolab/ui/components/button";
import type { ComponentProps } from "react";

type Props = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
};

export const GoogleAuthButton = ({
  label,
  onClick,
  loading = false,
  className,
  size = "default",
}: Props) => (
  <Button
    type="button"
    size={size}
    variant="outline"
    className={className}
    loading={loading}
    onClick={onClick}
    icon={<img src="/icons/google.svg" alt="Google" className="size-4" width={16} height={16} />}
  >
    {label}
  </Button>
);
