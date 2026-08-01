import type { UseQueryResult } from "@tanstack/react-query";

type QueryLoadingState = Pick<UseQueryResult, "isFetching" | "isLoading" | "isFetched">;

type QueryLoadingOptions = {
  isPending?: boolean;
};

export const isQueryContentLoading = (query: QueryLoadingState, options?: QueryLoadingOptions) =>
  Boolean(options?.isPending) || (query.isFetching && (query.isLoading || query.isFetched));

export const withOrgId = <TInput extends { organizationId: string }>(
  organizationId: string | null | undefined,
  input: Omit<TInput, "organizationId"> & Partial<Pick<TInput, "organizationId">>,
): TInput | undefined => {
  if (!organizationId) return undefined;
  return { ...input, organizationId } as TInput;
};
