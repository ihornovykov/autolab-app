import evlog from "evlog/nitro/v3";
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: {
    asyncContext: true,
  },
  traceDeps: ["react", "react-dom"],
  modules: [
    evlog({
      env: { service: "autolab-web" },
    }),
  ],
});
