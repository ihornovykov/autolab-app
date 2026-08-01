import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const toBinaryAssetBuffer = (
  imported: unknown,
  fallbackRelativePath: string,
  baseUrl = import.meta.url,
): Buffer => {
  if (imported instanceof Uint8Array) {
    return Buffer.from(imported);
  }

  if (typeof imported === "string") {
    if (imported.startsWith("/@fs")) {
      return readFileSync(imported.slice("/@fs".length));
    }

    try {
      return readFileSync(imported);
    } catch {
      // fall through to package-relative path
    }
  }

  const assetPath = join(dirname(fileURLToPath(baseUrl)), fallbackRelativePath);
  return readFileSync(assetPath);
};
