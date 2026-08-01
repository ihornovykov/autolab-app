import { cn } from "@autolab/ui/lib/utils";
import { ChevronRightIcon } from "lucide-react";

import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import {
  SEARCH_RESULT_TYPE_ICONS,
  SEARCH_RESULT_TYPE_LABELS,
} from "@/features/search/lib/constants";
import type { SearchResultType } from "@/features/search/lib/types";
import { Badge } from "@autolab/ui/components/badge";

export type SearchResultItemData = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  meta?: string;
  vehicleMake?: string;
  licensePlate?: string;
  relation: "match" | "related";
};

type Props = {
  item: SearchResultItemData;
  onClick: () => void;
};

export const SearchResultItem = ({ item, onClick }: Props) => {
  const Icon = SEARCH_RESULT_TYPE_ICONS[item.type];
  const showVehicleLogo = Boolean(item.vehicleMake);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 text-left transition-colors hover:bg-muted/30",
        item.relation === "related" && "ml-4 border-dashed bg-muted/10",
      )}
    >
      {showVehicleLogo ? (
        <VehicleMakeIcon
          make={item.vehicleMake!}
          className="size-10 rounded-lg border-0 bg-muted/70 shadow-none group-hover:bg-muted"
          iconClassName="size-4"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground group-hover:bg-muted">
          <Icon className="size-4" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{item.title}</span>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium">
            {SEARCH_RESULT_TYPE_LABELS[item.type]}
          </Badge>
          {item.relation === "related" ? (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Пов&apos;язано
            </span>
          ) : null}
        </div>
        {item.type === "vehicle" && item.licensePlate ? (
          <div className="mt-1.5 flex flex-col gap-1">
            {item.subtitle ? (
              <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
            ) : null}
            <LicencePlate plateNumber={item.licensePlate} className="origin-left scale-90" />
          </div>
        ) : item.subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
        ) : null}
      </div>

      {item.meta ? (
        <span className="hidden max-w-40 shrink-0 truncate text-right text-xs text-muted-foreground sm:block">
          {item.meta}
        </span>
      ) : null}

      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
};
