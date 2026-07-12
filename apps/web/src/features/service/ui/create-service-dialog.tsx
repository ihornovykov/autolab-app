import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ServiceForm } from "@/features/service/ui/service-form";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

const FORM_ID = "create-service-form";

type Props = {
  organizationId: string;
};

export const CreateServiceDialog = ({ organizationId }: Props) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    orpc.service.createService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.service.key() });
        toast.success("Послугу створено");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося створити послугу");
      },
    }),
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Додати послугу"
      description="Заповніть дані для нової послуги в прайс-листі."
      className="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogs.close()}
            disabled={createMutation.isPending}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            icon={<PlusIcon />}
            loading={createMutation.isPending}
          >
            Додати
          </Button>
        </div>
      }
    >
      <ServiceForm
        formId={FORM_ID}
        onSubmit={(values) => createMutation.mutate({ organizationId, ...values })}
      />
    </Dialog>
  );
};
