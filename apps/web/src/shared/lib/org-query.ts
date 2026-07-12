export const withOrgId = <TInput extends { organizationId: string }>(
  organizationId: string | null | undefined,
  input: Omit<TInput, "organizationId"> & Partial<Pick<TInput, "organizationId">>,
): TInput | undefined => {
  if (!organizationId) return undefined;
  return { ...input, organizationId } as TInput;
};
