import { getClientDisplayName } from "@/shared/lib/client";

type Client = {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
};

export const splitClientNameQuery = (query: string) => {
  const parts = query.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return { firstName: "", lastName: "", middleName: "" };
  if (parts.length === 1) return { firstName: parts[0] ?? "", lastName: "", middleName: "" };
  if (parts.length === 2)
    return { lastName: parts[0] ?? "", firstName: parts[1] ?? "", middleName: "" };

  return {
    lastName: parts[0] ?? "",
    firstName: parts[1] ?? "",
    middleName: parts.slice(2).join(" "),
  };
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
