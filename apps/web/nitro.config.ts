import evlog from "evlog/nitro/v3";
import { defineConfig } from "nitro";

export default defineConfig({
  traceDeps: ["pdfkit", "sharp", "tslib", "fontkit", "dejavu-fonts-ttf"],
  experimental: {
    asyncContext: true,
  },
  modules: [
    evlog({
      env: { service: "autolab-web" },
    }),
  ],
});
