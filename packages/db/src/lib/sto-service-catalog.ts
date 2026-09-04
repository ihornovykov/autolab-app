import { sql } from "drizzle-orm";

import stoServiceCatalog from "../seeds/data/sto-service-catalog.json";
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

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export const loadStoServiceCatalogRows = (): StoCatalogRow[] => stoServiceCatalog;

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
