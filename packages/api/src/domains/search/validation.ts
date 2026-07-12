import { z } from "zod";

export const searchResultTypeSchema = z.enum([
  "organization",
  "employee",
  "client",
  "vehicle",
  "service",
  "booking",
]);

export const searchResultRelationSchema = z.enum(["match", "related"]);

export const globalSearchInputSchema = z.object({
  organizationId: z.string().min(1).optional(),
  query: z.string().trim().min(1).max(100),
  limit: z.number().int().min(1).max(40).default(30),
});

export const globalSearchResultSchema = z.object({
  id: z.string(),
  type: searchResultTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  meta: z.string().optional(),
  vehicleMake: z.string().optional(),
  licensePlate: z.string().optional(),
  relation: searchResultRelationSchema,
  groupKey: z.string(),
});

export const globalSearchOutputSchema = z.object({
  items: z.array(globalSearchResultSchema),
});

export type GlobalSearchResult = z.infer<typeof globalSearchResultSchema>;
