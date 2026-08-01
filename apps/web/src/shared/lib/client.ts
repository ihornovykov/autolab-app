export const getClientName = (client: {
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
}) => [client.lastName, client.firstName, client.middleName].filter(Boolean).join(" ");

export const getClientDisplayName = (client: {
  firstName: string;
  lastName?: string | null;
}) => [client.firstName, client.lastName].filter(Boolean).join(" ");
