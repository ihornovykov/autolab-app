import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import { formatPrice } from "@/shared/lib/money";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { cn } from "@autolab/ui/lib/utils";

export type BookingServiceCatalogItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price: string;
  duration: number;
};

export type BookingServiceLineItem = {
  serviceId: string;
  quantity: number;
  unitPrice: string;
};

type Props = {
  services: BookingServiceCatalogItem[];
  value: BookingServiceLineItem[];
  onChange: (value: BookingServiceLineItem[]) => void;
  error?: string;
};

const normalizePrice = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed < 0) return "0.00";
  return parsed.toFixed(2);
};

const formatPriceOnBlur = (value: string) => {
  const parsed = Number(normalizePrice(value));
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

const formatPriceForEdit = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "";
  return parsed.toFixed(2).replace(".", ",");
};

type UnitPriceInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const UnitPriceInput = ({ value, onChange }: UnitPriceInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  return (
    <Input
      type="text"
      inputMode="decimal"
      className="h-8 tabular-nums"
      value={isEditing ? draft : formatPriceOnBlur(value)}
      onFocus={() => setDraft(formatPriceForEdit(value))}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const nextValue = normalizePrice(draft ?? value);
        onChange(nextValue);
        setDraft(null);
      }}
    />
  );
};

export const BookingServicePicker = ({ services, value, onChange, error }: Props) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const unique = new Set(services.map((service) => service.category?.trim() || "Інше"));
    return [...unique].sort((a, b) => a.localeCompare(b, "uk"));
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const category = service.category?.trim() || "Інше";
      const matchesCategory = !categoryFilter || category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        service.title.toLowerCase().includes(normalizedSearch) ||
        service.description?.toLowerCase().includes(normalizedSearch) ||
        category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, search, services]);

  const serviceMap = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );

  const totals = useMemo(() => {
    return value.reduce(
      (acc, item) => {
        const service = serviceMap.get(item.serviceId);
        const linePrice = Number(item.unitPrice) * item.quantity;
        const lineDuration = (service?.duration ?? 0) * item.quantity;
        return {
          price: acc.price + linePrice,
          duration: acc.duration + lineDuration,
        };
      },
      { price: 0, duration: 0 },
    );
  }, [serviceMap, value]);

  const addService = (serviceId: string) => {
    if (value.some((item) => item.serviceId === serviceId)) return;

    const service = serviceMap.get(serviceId);
    if (!service) return;

    onChange([
      ...value,
      {
        serviceId,
        quantity: 1,
        unitPrice: normalizePrice(service.price),
      },
    ]);
  };

  const updateItem = (
    serviceId: string,
    patch: Partial<Pick<BookingServiceLineItem, "quantity" | "unitPrice">>,
  ) => {
    onChange(
      value.map((item) =>
        item.serviceId === serviceId
          ? {
              ...item,
              ...patch,
              unitPrice: patch.unitPrice !== undefined ? patch.unitPrice : item.unitPrice,
              quantity:
                patch.quantity !== undefined
                  ? Math.max(1, Math.min(99, Math.trunc(patch.quantity)))
                  : item.quantity,
            }
          : item,
      ),
    );
  };

  const removeItem = (serviceId: string) => {
    onChange(value.filter((item) => item.serviceId !== serviceId));
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/60 p-4">
      <div>
        <p className="text-sm font-medium">Послуги *</p>
        <p className="text-xs text-muted-foreground">
          Оберіть категорію, знайдіть послугу та налаштуйте кількість і ціну
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            !categoryFilter
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted",
          )}
          onClick={() => setCategoryFilter(null)}
        >
          Усі
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              categoryFilter === category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
            onClick={() => setCategoryFilter((current) => (current === category ? null : category))}
          >
            {category}
          </button>
        ))}
      </div>

      <Input
        placeholder="Пошук послуги..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="max-h-44 space-y-1 overflow-auto rounded-lg border border-border/60 p-1">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => {
            const isSelected = value.some((item) => item.serviceId === service.id);

            return (
              <button
                key={service.id}
                type="button"
                disabled={isSelected}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "cursor-not-allowed bg-muted/50 text-muted-foreground"
                    : "cursor-pointer hover:bg-accent",
                )}
                onClick={() => addService(service.id)}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{service.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {service.category ?? "Інше"}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">{formatPrice(service.price)}</p>
                  <p>{service.duration} хв</p>
                </div>
              </button>
            );
          })
        ) : (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Послуг не знайдено</p>
        )}
      </div>

      {value.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Обрані послуги
          </p>
          {value.map((item) => {
            const service = serviceMap.get(item.serviceId);
            if (!service) return null;

            const lineTotal = Number(item.unitPrice) * item.quantity;

            return (
              <div
                key={item.serviceId}
                className="rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{service.title}</p>
                    <Badge variant="outline" className="mt-1 font-normal">
                      {service.category ?? "Інше"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.serviceId)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Кількість</p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-8"
                        onClick={() => updateItem(item.serviceId, { quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="size-3.5" />
                      </Button>
                      <Input
                        type="text"
                        inputMode="decimal"
                        min={1}
                        max={99}
                        className="h-8 w-12 text-center"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.serviceId, {
                            quantity: Number(event.target.value) || 1,
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-8"
                        onClick={() => updateItem(item.serviceId, { quantity: item.quantity + 1 })}
                        disabled={item.quantity >= 99}
                      >
                        <PlusIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ціна за од.</p>
                    <UnitPriceInput
                      value={item.unitPrice}
                      onChange={(unitPrice) => updateItem(item.serviceId, { unitPrice })}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {service.duration * item.quantity} хв
                  </span>
                  <span className="font-semibold tabular-nums">{formatPrice(lineTotal)}</span>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Разом</span>
            <span className="font-semibold tabular-nums">
              {formatPrice(totals.price)} · {totals.duration} хв
            </span>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};
