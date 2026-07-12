import { or, sql, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";

const CYRILLIC_TO_LATIN: ReadonlyArray<readonly [string, string]> = [
  ["А", "A"],
  ["а", "a"],
  ["В", "B"],
  ["в", "b"],
  ["С", "C"],
  ["с", "c"],
  ["Е", "E"],
  ["е", "e"],
  ["Ё", "E"],
  ["ё", "e"],
  ["Н", "H"],
  ["н", "h"],
  ["І", "I"],
  ["і", "i"],
  ["И", "I"],
  ["и", "i"],
  ["К", "K"],
  ["к", "k"],
  ["М", "M"],
  ["м", "m"],
  ["О", "O"],
  ["о", "o"],
  ["Р", "P"],
  ["р", "p"],
  ["Т", "T"],
  ["т", "t"],
  ["У", "Y"],
  ["у", "y"],
  ["Х", "X"],
  ["х", "x"],
];

export const normalizeHomoglyphs = (value: string): string => {
  let result = value;
  for (const [from, to] of CYRILLIC_TO_LATIN) {
    result = result.replaceAll(from, to);
  }
  return result;
};

export const homoglyphsSqlExpr = (value: SQL | AnyColumn): SQL => {
  let expr: SQL = sql`lower(${value}::text)`;
  for (const [from, to] of CYRILLIC_TO_LATIN) {
    expr = sql`replace(${expr}, ${from.toLowerCase()}, ${to.toLowerCase()})`;
  }
  return expr;
};

const patternCore = (pattern: string) => {
  if (pattern.startsWith("%") && pattern.endsWith("%")) {
    return pattern.slice(1, -1);
  }
  return pattern;
};

export const homoglyphPattern = (pattern: string) => {
  const normalized = normalizeHomoglyphs(patternCore(pattern)).toLowerCase();
  return `%${normalized}%`;
};

export const ilikeHomoglyph = (column: AnyColumn, pattern: string | undefined) => {
  if (!pattern) return undefined;
  return sql`${homoglyphsSqlExpr(column)} like ${homoglyphPattern(pattern)}`;
};

export const orHomoglyphs = (pattern: string | undefined, ...columns: AnyColumn[]) => {
  if (!pattern) return undefined;
  return or(...columns.map((column) => ilikeHomoglyph(column, pattern)!))!;
};
