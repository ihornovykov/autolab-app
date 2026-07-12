import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(scriptDir, "../../../../apps/web/.env") });

const { db } = await import("../index");
const { seedVehicleCatalog } = await import("../seeds/vehicle-catalog");
const { seedDemoData, printSeedCredentials } = await import("../seeds/demo-data");
const { seedProfileWorkingHours } = await import("../seeds/working-hours");

const main = async () => {
  console.log("Seeding vehicle catalog...");
  const catalog = await seedVehicleCatalog(db);
  console.log(`  ${catalog.makes} makes, ${catalog.models} models`);

  console.log("Seeding demo organization data...");
  const demo = await seedDemoData(db);
  console.log(`  organization: ${demo.organizationId}`);
  console.log(`  bookings: ${demo.bookingCount}`);

  console.log("Seeding profile working hours...");
  const profileHours = await seedProfileWorkingHours(db);
  console.log(`  profiles updated: ${profileHours}`);

  printSeedCredentials();
  console.log("Database seed completed.");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
