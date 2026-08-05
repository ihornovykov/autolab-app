import { and, or, sql, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";

import { normalizeSearch } from "./pagination";
import { homoglyphPattern, homoglyphsSqlExpr, normalizeHomoglyphs } from "./normalize";

const buildVehicleFieldMatch = (columns: VehicleSearchColumns, tokenPattern: string): SQL => {
  const pattern = homoglyphPattern(tokenPattern);
  const parts: SQL[] = [
    sql`${homoglyphsSqlExpr(columns.make)} like ${pattern}`,
    sql`${homoglyphsSqlExpr(columns.model)} like ${pattern}`,
    sql`${homoglyphsSqlExpr(sql`concat(${columns.make}, ' ', ${columns.model})`)} like ${pattern}`,
    sql`${homoglyphsSqlExpr(sql`concat(${columns.model}, ' ', ${columns.make})`)} like ${pattern}`,
  ];

  if (columns.licensePlate) {
    parts.push(sql`${homoglyphsSqlExpr(columns.licensePlate)} like ${pattern}`);
  }

  if (columns.vin) {
    parts.push(sql`${homoglyphsSqlExpr(columns.vin)} like ${pattern}`);
  }

  return or(...parts)!;
};

type VehicleSearchColumns = {
  make: AnyColumn;
  model: AnyColumn;
  licensePlate?: AnyColumn;
  vin?: AnyColumn;
};

export const splitSearchTokens = (search: string) =>
  normalizeHomoglyphs(normalizeSearch(search))
    .split(/\s+/)
    .filter((token) => token.length > 0);

export const buildVehicleSearchCondition = (
  columns: VehicleSearchColumns,
  rawSearch: string,
): SQL | undefined => {
  const normalized = normalizeHomoglyphs(normalizeSearch(rawSearch));
  if (!normalized) return undefined;

  const pattern = `%${normalized}%`;
  const tokens = splitSearchTokens(normalized);
  const conditions: SQL[] = [buildVehicleFieldMatch(columns, pattern)];

  if (tokens.length > 1) {
    conditions.push(
      and(...tokens.map((token) => buildVehicleFieldMatch(columns, `%${token}%`)))!,
    );
  }

  return or(...conditions)!;
};
