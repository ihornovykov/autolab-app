import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

const pdfExternals = [
  "pdfkit",
  "fontkit",
  "sharp",
  "tslib",
  "dejavu-fonts-ttf",
];

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    external: pdfExternals,
  },
  build: {
    rolldownOptions: {
      external: pdfExternals,
    },
  },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
});
