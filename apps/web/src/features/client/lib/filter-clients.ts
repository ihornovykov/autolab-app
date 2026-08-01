import { getClientDisplayName } from "@/shared/lib/client";

type Client = {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
};

export const filterClients = <T extends Client>(clients: T[], search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return clients;

  return clients.filter((client) => {
    const name = getClientDisplayName(client).toLowerCase();

    return (
      name.includes(query) ||
      (client.phone ?? "").toLowerCase().includes(query) ||
      (client.email ?? "").toLowerCase().includes(query)
    );
  });
};
