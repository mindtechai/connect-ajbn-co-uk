import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // In production, Lovable's edge serves `/__l5e/assets-v1/*`. Locally,
    // Vite has no such route, so pointer URLs would 404 (and fall through to
    // the SPA HTML). This proxy is the *default same-origin fallback* for
    // dev — apps that set VITE_ASSET_BASE_URL to an absolute origin bypass it
    // entirely (see src/lib/asset.ts).
    proxy: {
      "/__l5e": {
        target: "https://impact-connect-guild.lovable.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
