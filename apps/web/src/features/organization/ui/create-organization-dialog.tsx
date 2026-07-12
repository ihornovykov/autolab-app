import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CreateOrganizationForm } from "@/features/organization/ui/create-organization-form";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { useOrganizationStore } from "@/shared/stores/organization";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

const FORM_ID = "create-organization-form";

export const CreateOrganizationDialog = () => {
  const queryClient = useQueryClient();
  const setSelectedOrganizationId = useOrganizationStore(
    (state) => state.setSelectedOrganizationId,
  );

  const createMutation = useMutation(
    orpc.organization.createOrganization.mutationOptions({
      onSuccess: (organization) => {
        queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
        setSelectedOrganizationId(organization.id);
        toast.success("Організацію успішно створено");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Помилка при створенні організації");
      },
    }),
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Створити нову організацію"
      description="Заповніть деталі, щоб створити нову організацію."
      className="max-w-[900px]"
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
          <Button type="submit" form={FORM_ID} loading={createMutation.isPending}>
            Зберегти організацію
          </Button>
        </div>
      }
    >
      <CreateOrganizationForm
        formId={FORM_ID}
        onSubmit={(values) => createMutation.mutate(values)}
      />
    </Dialog>
  );
};
