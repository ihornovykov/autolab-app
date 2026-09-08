import { MinusIcon, PlusCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  BookingServiceCatalogItem,
  BookingServiceLineItem,
} from "@/features/booking/lib/types";
import { SERVICE_CATEGORIES } from "@/features/service/lib/constants";
import { useCreateCatalogService } from "@/features/service/hooks/use-create-catalog-service";
import { formatPrice } from "@/shared/lib/money";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { cn } from "@autolab/ui/lib/utils";

export type { BookingServiceCatalogItem, BookingServiceLineItem };

type Props = {
  organizationId: string;
  services: BookingServiceCatalogItem[];
  value: BookingServiceLineItem[];
  onChange: (value: BookingServiceLineItem[]) => void;
  onServiceCreated: (service: BookingServiceCatalogItem) => void;
  error?: string;
};

type ServiceDraft = {
  title: string;
  category: string;
  price: string;
  duration: string;
};

type ServiceDraftErrors = {
  title?: string;
  price?: string;
  duration?: string;
};

const DEFAULT_SERVICE_CATEGORY = "Інше";
const DEFAULT_SERVICE_DURATION = "60";

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

const createEmptyDraft = (title = "", category = DEFAULT_SERVICE_CATEGORY): ServiceDraft => ({
  title,
  category,
  price: "",
  duration: DEFAULT_SERVICE_DURATION,
});

const validateServiceDraft = (draft: ServiceDraft): ServiceDraftErrors => {
  const errors: ServiceDraftErrors = {};
  const price = Number(draft.price.trim().replace(",", "."));
  const duration = Number(draft.duration);

  if (!draft.title.trim()) errors.title = "Назва обов'язкова";
  if (!draft.price.trim() || Number.isNaN(price) || price <= 0) errors.price = "Некоректна ціна";
  if (!draft.duration.trim() || !Number.isInteger(duration) || duration <= 0)
    errors.duration = "Тривалість має бути більше 0";

  return errors;
};

export const BookingServicePicker = ({
  organizationId,
  services,
  value,
  onChange,
  onServiceCreated,
  error,
}: Props) => {
  const { createCatalogService, isCreatingService } = useCreateCatalogService(organizationId);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(services.length === 0);
  const [draft, setDraft] = useState<ServiceDraft>(() => createEmptyDraft());
  const [draftErrors, setDraftErrors] = useState<ServiceDraftErrors>({});

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

  const appendService = (service: BookingServiceCatalogItem) => {
    if (value.some((item) => item.serviceId === service.id)) return;

    onChange([
      ...value,
      {
        serviceId: service.id,
        quantity: 1,
        unitPrice: normalizePrice(service.price),
      },
    ]);
  };

  const addService = (serviceId: string) => {
    const service = serviceMap.get(serviceId);
    if (!service) return;
    appendService(service);
  };

  const handleStartCreate = (title = "") => {
    setDraft(createEmptyDraft(title, categoryFilter ?? DEFAULT_SERVICE_CATEGORY));
    setDraftErrors({});
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setDraftErrors({});
  };

  const handleCreateService = async () => {
    const nextErrors = validateServiceDraft(draft);
    setDraftErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const service = await createCatalogService({
        title: draft.title.trim(),
        price: normalizePrice(draft.price),
        duration: Number(draft.duration),
        category: draft.category || DEFAULT_SERVICE_CATEGORY,
      });

      onServiceCreated(service);
      appendService(service);
      setSearch("");
      setIsCreating(false);
      setDraft(createEmptyDraft());
      setDraftErrors({});
    } catch (createError) {
      toast.error(
        createError instanceof Error ? createError.message : "Не вдалося створити послугу",
      );
    }
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
          Оберіть категорію, знайдіть послугу або додайте власну
        </p>
      </div>

      {categories.length > 0 ? (
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
              onClick={() =>
                setCategoryFilter((current) => (current === category ? null : category))
              }
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      {services.length > 0 ? (
        <Input
          placeholder="Пошук послуги..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      ) : null}

      {services.length > 0 ? (
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
                    "flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
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
            <div className="space-y-2 px-2 py-4 text-center">
              <p className="text-sm text-muted-foreground">Послуг не знайдено</p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                onClick={() => handleStartCreate(search.trim())}
              >
                <PlusIcon className="size-3.5" />
                {search.trim() ? `Створити послугу «${search.trim()}»` : "Додати власну послугу"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {isCreating ? (
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/15 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Нова послуга</p>
              <p className="text-xs text-muted-foreground">
                Її буде додано до прайс-листа і до цього запису
              </p>
            </div>
            {services.length > 0 ? (
              <Button type="button" variant="secondary" size="sm" onClick={handleCancelCreate}>
                Скасувати
              </Button>
            ) : null}
          </div>

          <Input
            autoFocus
            label="Назва *"
            placeholder="Заміна лампи"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            error={draftErrors.title}
          />

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Категорія</Label>
              <Select
                value={draft.category}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    category: value ?? DEFAULT_SERVICE_CATEGORY,
                  }))
                }
                items={SERVICE_CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
              >
                <SelectTrigger className="mb-0">
                  <SelectValue placeholder="Категорія" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Ціна (₴) *"
              placeholder="800"
              type="text"
              inputMode="decimal"
              value={draft.price}
              onChange={(event) =>
                setDraft((current) => ({ ...current, price: event.target.value }))
              }
              error={draftErrors.price}
            />
            <Input
              label="Тривалість (хв) *"
              placeholder="60"
              type="number"
              inputMode="numeric"
              min="1"
              value={draft.duration}
              onChange={(event) =>
                setDraft((current) => ({ ...current, duration: event.target.value }))
              }
              error={draftErrors.duration}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              icon={<PlusIcon />}
              loading={isCreatingService}
              onClick={handleCreateService}
            >
              Додати послугу
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          onClick={() => handleStartCreate(search.trim())}
        >
          <PlusCircleIcon className="size-3.5" />
          Послуги немає в списку
        </button>
      )}

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
