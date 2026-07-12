export const DEFAULT_PAGE_SIZE = 25;

export const DEFAULT_SELECT_PAGE_SIZE = 100;

export type PaginationState = {
  page: number;
  pageSize: number;
};

export const createListInput = <T extends Record<string, unknown>>(
  organizationId: string,
  params: T,
  pagination?: Partial<PaginationState>,
) => ({
  organizationId,
  page: pagination?.page ?? 1,
  pageSize: pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
  ...params,
});

export const createSelectListInput = (organizationId: string, search = "") => ({
  organizationId,
  page: 1,
  pageSize: DEFAULT_SELECT_PAGE_SIZE,
  search: search || undefined,
});
