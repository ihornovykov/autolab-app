import { UserRound } from "lucide-react";

import { cn } from "@autolab/ui/lib/utils";

type Props = {
  name: string;
  image?: string | null;
  className?: string;
};

export const UserAvatar = ({ name, image, className }: Props) => (
  <div
    className={cn(
      "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs font-medium text-muted-foreground",
      className,
    )}
  >
    {image ? (
      <img src={image} alt={name} className="size-full object-cover" />
    ) : (
      <UserRound size={16} strokeWidth={2} className="opacity-60" />
    )}
  </div>
);
