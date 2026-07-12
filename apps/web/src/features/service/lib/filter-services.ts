type Service = {
  title: string;
  description?: string | null;
};

export const filterServices = <T extends Service>(services: T[], search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return services;

  return services.filter(
    (service) =>
      service.title.toLowerCase().includes(query) ||
      (service.description ?? "").toLowerCase().includes(query),
  );
};
