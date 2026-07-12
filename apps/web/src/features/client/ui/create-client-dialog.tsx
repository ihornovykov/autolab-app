import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ClientForm } from "@/features/client/ui/client-form";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

const FORM_ID = "create-client-form";

type Props = {
  organizationId: string;
};

export const CreateClientDialog = ({ organizationId }: Props) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    orpc.client.createClient.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.client.key() });
        toast.success("Клієнта створено");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося створити клієнта");
      },
    }),
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Додати клієнта"
      description="Введіть дані клієнта для додавання до організації."
      className="max-w-[600px]"
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
      <ClientForm
        formId={FORM_ID}
        onSubmit={(values) => createMutation.mutate({ organizationId, ...values })}
      />
    </Dialog>
  );
};
