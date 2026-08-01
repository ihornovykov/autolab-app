import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import { Label } from "@autolab/ui/components/label";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  organizationId: string;
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

const formatVehicleLabel = (vehicle: {
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
}) => {
  const parts = [vehicle.make, vehicle.model, String(vehicle.year)];
  if (vehicle.licensePlate) parts.push(vehicle.licensePlate);
  if (vehicle.vin) parts.push(vehicle.vin);
  return parts.filter(Boolean).join(" · ");
};

export const VehicleSearchSelect = ({
  organizationId,
  value,
  onValueChange,
  label = "Автомобіль *",
  placeholder = "Оберіть автомобіль",
  error,
  disabled,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const vehiclesQuery = useQuery({
    ...orpc.vehicle.listVehicles.queryOptions({
      input: {
        organizationId,
        page: 1,
        pageSize: 50,
        search: debouncedQuery || undefined,
      },
    }),
    enabled: !!organizationId && isOpen,
  });

  const selectedVehicleQuery = useQuery({
    ...orpc.vehicle.getVehicleById.queryOptions({
      input: { organizationId, vehicleId: value },
    }),
    enabled: !!organizationId && !!value,
  });

  const options = useMemo(() => {
    const items = vehiclesQuery.data?.items ?? [];
    const selected = selectedVehicleQuery.data;

    const merged = selected && !items.some((item) => item.id === selected.id)
      ? [selected, ...items]
      : items;

    return merged.map((vehicle) => ({
      value: vehicle.id,
      label: formatVehicleLabel(vehicle),
    }));
  }, [vehiclesQuery.data?.items, selectedVehicleQuery.data]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    (selectedVehicleQuery.data ? formatVehicleLabel(selectedVehicleQuery.data) : undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative space-y-1">
      {label ? <Label>{label}</Label> : null}
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md">
          <div className="border-b border-input p-2">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук за маркою, моделлю, номером..."
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <ul className="max-h-60 overflow-auto p-1">
            {vehiclesQuery.isLoading ? (
              <li className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Пошук...
              </li>
            ) : options.length > 0 ? (
              options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      option.value === value && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                Автомобілів не знайдено
              </li>
            )}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
