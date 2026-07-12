import { Loader2 } from "lucide-react";

import { cn } from "@autolab/ui/lib/utils";

type Props = {
  className?: string;
};

export const Loader = ({ className }: Props) => (
  <div className={cn("flex h-full items-center justify-center pt-8", className)}>
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);
