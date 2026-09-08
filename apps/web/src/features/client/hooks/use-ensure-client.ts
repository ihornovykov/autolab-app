import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import type { ClientFormValues } from "@/features/client/ui/client-form";
import { orpc } from "@/shared/api/orpc";

type EnsureClientInput = {
  clientId?: string;
  newClient?: ClientFormValues;
};

export const useEnsureClient = (organizationId: string) => {
  const queryClient = useQueryClient();
  const createdClientIdRef = useRef<string | null>(null);

  const createMutation = useMutation(
    orpc.client.createClient.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.client.key() });
      },
    }),
  );

  const ensureClientId = async ({ clientId, newClient }: EnsureClientInput) => {
    if (createdClientIdRef.current) return createdClientIdRef.current;
    if (clientId) return clientId;

    if (!newClient) throw new Error("Клієнт обов'язковий");

    const client = await createMutation.mutateAsync({
      organizationId,
      ...newClient,
    });

    createdClientIdRef.current = client.id;
    return client.id;
  };

  return {
    ensureClientId,
    isEnsuringClient: createMutation.isPending,
  };
};
