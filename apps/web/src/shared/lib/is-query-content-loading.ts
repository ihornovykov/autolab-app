import type { UseQueryResult } from "@tanstack/react-query";

type QueryLoadingState = Pick<UseQueryResult, "isFetching" | "isLoading" | "isFetched">;

type Options = {
  isPending?: boolean;
};

export const isQueryContentLoading = (query: QueryLoadingState, options?: Options) =>
  Boolean(options?.isPending) || (query.isFetching && (query.isLoading || query.isFetched));
