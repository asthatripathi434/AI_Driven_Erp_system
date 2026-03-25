import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import history from "connect-history-api-fallback";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [".."],
    },
    middlewareMode: false, // normal dev server mode
    setupMiddlewares(middlewares) {
      middlewares.push(history());
      return middlewares;
    },
  },
  build: {
    outDir: "dist",
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
