export const resolveDatabaseUrl = (databaseUrl: string) => {
  if (!databaseUrl.includes("sslmode=require")) return databaseUrl;
  if (databaseUrl.includes("uselibpqcompat")) return databaseUrl;

  const separator = databaseUrl.includes("?") ? "&" : "?";
  return `${databaseUrl}${separator}uselibpqcompat=true`;
};
