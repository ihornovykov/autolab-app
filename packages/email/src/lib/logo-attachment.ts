import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const emailLogoPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../assets/autolab-icon.png",
);
