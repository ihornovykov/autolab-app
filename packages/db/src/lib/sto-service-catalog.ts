import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";

import { services } from "../schema/service";
import type { createDb } from "../index";

type Db = Pick<ReturnType<typeof createDb>, "insert">;

export type StoCatalogRow = {
  category: string;
  title: string;
  description: string;
  price: string;
  duration: number;
};

type CreateDefaultServicesOptions = {
  createServiceId?: (index: number) => string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(scriptDir, "../seeds/data/sto-service-catalog.csv");

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const parseCatalogRow = (line: string): StoCatalogRow => {
  const parts = line.split(",");
  const duration = Number(parts.pop());
  const price = Number(parts.pop()).toFixed(2);
  const category = parts.shift() ?? "Інше";
  const title = parts.shift() ?? "";
  const description = parts.join(",");

  return {
    category,
    title,
    description,
    price,
    duration: Number.isFinite(duration) ? duration : 60,
  };
};

export const loadStoServiceCatalogRows = (): StoCatalogRow[] => {
  const content = readFileSync(catalogPath, "utf-8");
  return content
    .trim()
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .map(parseCatalogRow);
};

export const createStableCatalogServiceId = (index: number) =>
  `catalog-service-${String(index + 1).padStart(3, "0")}`;

export const createDefaultOrganizationServices = async (
  db: Db,
  organizationId: string,
  options?: CreateDefaultServicesOptions,
) => {
  const rows = loadStoServiceCatalogRows();
  const createServiceId = options?.createServiceId ?? (() => crypto.randomUUID());

  const values = rows.map((row, index) => ({
    id: createServiceId(index),
    organizationId,
    category: row.category,
    title: row.title,
    description: row.description,
    price: row.price,
    duration: row.duration,
  }));

  for (const batch of chunk(values, 100)) {
    await db
      .insert(services)
      .values(batch)
      .onConflictDoUpdate({
        target: services.id,
        set: {
          category: sql`excluded.category`,
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          price: sql`excluded.price`,
          duration: sql`excluded.duration`,
          updatedAt: new Date(),
        },
      });
  }

  return values.length;
};
