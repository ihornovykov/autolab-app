import { cn } from "@autolab/ui/lib/utils";
import { Building2 } from "lucide-react";

type Props = {
  name: string;
  image?: string | null;
  className?: string;
};

export const OrganizationLogo = ({ name, image, className }: Props) => (
  <div
    className={cn(
      "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted",
      className,
    )}
  >
    {image ? (
      <img src={image} alt={name} className="aspect-square h-full w-full object-cover" />
    ) : (
      <Building2 size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
    )}
  </div>
);
