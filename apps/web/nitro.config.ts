import evlog from "evlog/nitro/v3";
import { defineConfig } from "nitro";

export default defineConfig({
  traceDeps: [
    "pdfkit",
    "fontkit",
    "sharp",
    "tslib",
    "dejavu-fonts-ttf",
    "geist",
  ],
  experimental: {
    asyncContext: true,
  },
  modules: [
    evlog({
      env: { service: "autolab-web" },
    }),
  ],
});
