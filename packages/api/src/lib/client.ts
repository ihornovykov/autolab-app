export const getClientName = (client: {
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
}) => [client.lastName, client.firstName, client.middleName].filter(Boolean).join(" ");
