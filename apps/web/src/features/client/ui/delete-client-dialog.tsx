import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { getClientDisplayName } from "@/shared/lib/client";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  organizationId: string;
  clientId: string;
  firstName: string;
  lastName?: string | null;
};

export const DeleteClientDialog = ({
  organizationId,
  clientId,
  firstName,
  lastName,
}: Props) => {
  const queryClient = useQueryClient();
  const clientName = getClientDisplayName({ firstName, lastName });

  const deleteMutation = useMutation(
    orpc.client.deleteClient.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.client.key() });
        toast.success("Клієнта видалено");
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося видалити клієнта");
      },
    }),
  );

  return (
    <ConfirmDialog
      title="Видалити клієнта"
      description={`Ви впевнені, що хочете видалити ${clientName}? Цю дію неможливо скасувати.`}
      confirmLabel="Видалити"
      variant="destructive"
      onConfirm={async () => {
        await deleteMutation.mutateAsync({ organizationId, clientId });
      }}
    />
  );
};
