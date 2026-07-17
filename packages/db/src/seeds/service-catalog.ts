import type { createDb } from "../index";
import {
  createDefaultOrganizationServices,
  createStableCatalogServiceId,
} from "../lib/sto-service-catalog";
import { SEED_IDS } from "./constants";

type Db = ReturnType<typeof createDb>;

export const seedServiceCatalog = async (db: Db, organizationId = SEED_IDS.organization) =>
  createDefaultOrganizationServices(db, organizationId, {
    createServiceId: createStableCatalogServiceId,
  });
