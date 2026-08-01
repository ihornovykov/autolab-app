import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClockIcon } from "lucide-react";
import { toast } from "sonner";

import { DeleteServiceDialog } from "@/features/service/ui/delete-service-dialog";
import { ServiceForm } from "@/features/service/ui/service-form";
import { orpc } from "@/shared/api/orpc";
import { formatPrice } from "@/shared/lib/money";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";

const FORM_ID = "edit-service-form";

type Service = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price: string;
  duration: number;
};

type Props = {
  service: Service;
  organizationId: string;
};

export const EditServiceSheet = ({ service, organizationId }: Props) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    orpc.service.updateService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.service.key() });
        toast.success("Послугу оновлено");
        sheets.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити послугу");
      },
    }),
  );

  const handleDeleteClick = () => {
    sheets.close();
    dialogs.open(
      <DeleteServiceDialog
        organizationId={organizationId}
        serviceId={service.id}
        title={service.title}
      />,
    );
  };

  const isBusy = updateMutation.isPending;

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title={service.title}
      description="Редагування послуги"
      className="sm:max-w-lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={handleDeleteClick}
          >
            Видалити
          </Button>
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => sheets.close()}
            >
              Закрити
            </Button>
            <Button type="submit" form={FORM_ID} loading={isBusy}>
              Зберегти зміни
            </Button>
          </div>
        </div>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{service.title}</p>
          {service.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant="green" className="px-2.5 py-1 text-sm font-semibold">
            {formatPrice(service.price)}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            {service.duration} хв
          </span>
        </div>
      </div>

      <ServiceForm
        formId={FORM_ID}
        initialValues={{
          category: service.category ?? undefined,
          title: service.title,
          description: service.description ?? undefined,
          price: service.price,
          duration: service.duration,
        }}
        onSubmit={(values) =>
          updateMutation.mutate({
            organizationId,
            serviceId: service.id,
            ...values,
          })
        }
      />
    </Sheet>
  );
};
