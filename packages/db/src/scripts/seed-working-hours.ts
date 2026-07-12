import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(scriptDir, "../../../../apps/web/.env") });

const { db } = await import("../index");
const { seedProfileWorkingHours } = await import("../seeds/working-hours");

const main = async () => {
  const seeded = await seedProfileWorkingHours(db);
  console.log(`Seeded profile working hours for ${seeded} profiles`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
