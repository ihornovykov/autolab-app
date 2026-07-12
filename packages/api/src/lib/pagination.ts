import { z } from "zod";

import { normalizeHomoglyphs } from "./search-normalize";

export const paginationInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export const searchInputSchema = z.object({
  search: z.string().optional(),
});

export const createPaginatedOutputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
  });

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const getOffset = (page: number, pageSize: number) => (page - 1) * pageSize;

export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> => ({
  items,
  total,
  page,
  pageSize,
  totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
});

export const normalizeSearch = (search?: string) => search?.trim() ?? "";

export const searchPattern = (search?: string) => {
  const normalized = normalizeHomoglyphs(normalizeSearch(search));
  return normalized ? `%${normalized}%` : undefined;
};
