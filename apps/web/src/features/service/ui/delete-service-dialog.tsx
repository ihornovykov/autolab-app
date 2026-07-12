import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  organizationId: string;
  serviceId: string;
  title: string;
};

export const DeleteServiceDialog = ({ organizationId, serviceId, title }: Props) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    orpc.service.deleteService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.service.key() });
        toast.success("Послугу видалено");
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося видалити послугу");
      },
    }),
  );

  return (
    <ConfirmDialog
      title="Видалити послугу"
      description={`Ви впевнені, що хочете видалити «${title}»? Цю дію неможливо скасувати.`}
      confirmLabel="Видалити"
      variant="destructive"
      onConfirm={async () => {
        await deleteMutation.mutateAsync({ organizationId, serviceId });
      }}
    />
  );
};
