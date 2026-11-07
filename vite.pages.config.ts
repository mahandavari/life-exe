import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Keep the existing Sites build intact; this target serves the same experience
// as static files under the GitHub Pages repository path.
export default defineConfig({
  root: fileURLToPath(new URL("./static-app", import.meta.url)),
  base: "/life-exe/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    target: "es2022",
  },
});

