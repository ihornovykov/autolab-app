import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import type { StressSeedConfig } from "../seeds/stress-data";

const scriptDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(scriptDir, "../../../../apps/web/.env") });

const { db } = await import("../index");
const { seedDemoData, printSeedCredentials } = await import("../seeds/demo-data");
const {
  DEFAULT_STRESS_SEED_CONFIG,
  seedStressData,
} = await import("../seeds/stress-data");
const { seedVehicleCatalog } = await import("../seeds/vehicle-catalog");
const { seedProfileWorkingHours } = await import("../seeds/working-hours");

const readCount = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

const config: StressSeedConfig = {
  clientCount: readCount("STRESS_CLIENT_COUNT", DEFAULT_STRESS_SEED_CONFIG.clientCount),
  extraServiceCount: readCount(
    "STRESS_SERVICE_COUNT",
    DEFAULT_STRESS_SEED_CONFIG.extraServiceCount,
  ),
  bookingCount: readCount("STRESS_BOOKING_COUNT", DEFAULT_STRESS_SEED_CONFIG.bookingCount),
};

const main = async () => {
  console.log("Seeding vehicle catalog...");
  const catalog = await seedVehicleCatalog(db);
  console.log(`  ${catalog.makes} makes, ${catalog.models} models`);

  console.log("Seeding base demo data...");
  const demo = await seedDemoData(db);
  console.log(`  organization: ${demo.organizationId}`);
  console.log(`  base bookings: ${demo.bookingCount}`);

  console.log("Seeding stress test data...");
  console.log(
    `  targets: ${config.clientCount} clients, ${config.extraServiceCount} extra services, ${config.bookingCount} bookings`,
  );

  const stress = await seedStressData(db, config);
  console.log(`  clients: ${stress.clients}`);
  console.log(`  vehicles: ${stress.vehicles}`);
  console.log(`  extra services: ${stress.services}`);
  console.log(`  total services: ${stress.totalServices}`);
  console.log(`  bookings: ${stress.bookings}`);

  console.log("Seeding profile working hours...");
  const profileHours = await seedProfileWorkingHours(db);
  console.log(`  profiles updated: ${profileHours}`);

  printSeedCredentials();
  console.log("Stress seed completed.");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
