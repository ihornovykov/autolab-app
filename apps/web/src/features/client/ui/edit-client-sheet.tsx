import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PhoneIcon } from "lucide-react";
import { toast } from "sonner";

import { ClientForm } from "@/features/client/ui/client-form";
import { DeleteClientDialog } from "@/features/client/ui/delete-client-dialog";
import { orpc } from "@/shared/api/orpc";
import { getClientDisplayName, getClientName } from "@/shared/lib/format";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";

const FORM_ID = "edit-client-form";

type Client = {
  id: string;
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  email?: string | null;
};

type Props = {
  client: Client;
  organizationId: string;
};

export const EditClientSheet = ({ client, organizationId }: Props) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    orpc.client.updateClient.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.client.key() });
        toast.success("Клієнта оновлено");
        sheets.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити клієнта");
      },
    }),
  );

  const handleDeleteClick = () => {
    sheets.close();
    dialogs.open(
      <DeleteClientDialog
        organizationId={organizationId}
        clientId={client.id}
        firstName={client.firstName}
        lastName={client.lastName}
      />,
    );
  };

  const isBusy = updateMutation.isPending;

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title={getClientName(client)}
      description="Редагування клієнта"
      className="sm:max-w-md"
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
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {client.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{getClientDisplayName(client)}</p>
          {client.email ? (
            <p className="truncate text-xs text-muted-foreground">{client.email}</p>
          ) : null}
          {client.phone ? (
            <Badge variant="secondary" className="mt-2 gap-1">
              <PhoneIcon className="size-3" />
              {client.phone}
            </Badge>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Телефон не вказано</p>
          )}
        </div>
      </div>

      <ClientForm
        formId={FORM_ID}
        initialValues={{
          firstName: client.firstName,
          lastName: client.lastName ?? undefined,
          middleName: client.middleName ?? undefined,
          phone: client.phone ?? undefined,
        }}
        onSubmit={(values) =>
          updateMutation.mutate({ organizationId, clientId: client.id, ...values })
        }
      />
    </Sheet>
  );
};
