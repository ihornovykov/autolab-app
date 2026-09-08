import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/shared/api/orpc";

export type CatalogServiceDraft = {
  title: string;
  price: string;
  duration: number;
  category?: string;
};

export const useCreateCatalogService = (organizationId: string) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    orpc.service.createService.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.service.key() });
      },
    }),
  );

  const createCatalogService = async (draft: CatalogServiceDraft) => {
    const service = await createMutation.mutateAsync({
      organizationId,
      title: draft.title,
      price: draft.price,
      duration: draft.duration,
      category: draft.category,
    });

    return {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
    };
  };

  return {
    createCatalogService,
    isCreatingService: createMutation.isPending,
  };
};
