import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/shared/lib/auth";

export const connectedAccountsQueryKey = ["auth", "connected-accounts"] as const;

export const useConnectedAccounts = () =>
  useQuery({
    queryKey: connectedAccountsQueryKey,
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();

      if (error) throw new Error(error.message ?? "Не вдалося завантажити способи входу");

      return data ?? [];
    },
  });
