// Vite configuration for TanStack Start with TailwindCSS and Cloudflare
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/vite";
import { viteReact } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  plugins: [tanstackStart(), viteReact(), tailwindcss(), tsConfigPaths()],
  tanstackStart: {
    server: { entry: "server" },
  },
});
