import { defaultParseSearch } from "@tanstack/react-router";

const decodeUnicodeEscapes = (value: string) =>
  value.replace(/(?:%[89A-Fa-f][0-9A-Fa-f])+/g, (match) => {
    try {
      return decodeURIComponent(match);
    } catch {
      return match;
    }
  });

export const decodeUnicodeHref = (href: string) => {
  const hashIndex = href.indexOf("#");
  const searchIndex = href.indexOf("?");
  if (searchIndex === -1 && hashIndex === -1) return href;

  const pathnameEnd = searchIndex === -1 ? hashIndex : searchIndex;
  return `${href.slice(0, pathnameEnd)}${decodeUnicodeEscapes(href.slice(pathnameEnd))}`;
};

const encodeSearchKey = (key: string) =>
  key
    .replace(/#/g, "%23")
    .replace(/&/g, "%26")
    .replace(/\+/g, "%2B")
    .replace(/=/g, "%3D")
    .replace(/\?/g, "%3F");

const encodeSearchValue = (value: string) =>
  value
    .replace(/%/g, "%25")
    .replace(/\+/g, "%2B")
    .replace(/ /g, "+")
    .replace(/#/g, "%23")
    .replace(/&/g, "%26")
    .replace(/"/g, "%22")
    .replace(/'/g, "%27")
    .replace(/`/g, "%60")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/[\x00-\x1F]/g, (char) => encodeURIComponent(char));

const stringifySearchValue = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const items = value
      .map((item) => stringifySearchValue(item))
      .filter((item): item is string => item !== null && item !== "");
    return items.length > 0 ? items.join(",") : null;
  }
  return JSON.stringify(value);
};

export const parseSearch = defaultParseSearch;

export const stringifySearch = (search: Record<string, unknown>) => {
  const parts: string[] = [];

  for (const [key, raw] of Object.entries(search)) {
    const encoded = stringifySearchValue(raw);
    if (encoded === null || encoded === "") continue;
    parts.push(`${encodeSearchKey(key)}=${encodeSearchValue(encoded)}`);
  }

  return parts.length > 0 ? `?${parts.join("&")}` : "";
};
