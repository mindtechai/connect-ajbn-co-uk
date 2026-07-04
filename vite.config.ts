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
    // In production, Lovable's edge serves `/__l5e/assets-v1/*` from its CDN.
    // The local Vite dev server has no such route, so asset pointer URLs 404
    // (and get rewritten to the SPA fallback HTML). Proxy those requests to
    // the published deployment so uploaded assets render correctly in dev.
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
